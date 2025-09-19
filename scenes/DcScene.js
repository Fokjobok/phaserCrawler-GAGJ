import CONFIG from "../config/config.js"

import { preload_textBox, preload_styleMenu, preload_dungeon } from "../config/preload.js"
import { create_dialogContainer, create_textBox, create_npcImage, create_speakerNameBox } from "../config/create.js"
import { showInventoryMenu, showMovementMenu, showQuestLog, showStatusCards } from "../config/menus.js"
import { showDialog, resize_bg } from "../config/dialogs.js"

import { buildDungeon } from "../src/dc/generator.js"


function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }

const EVENT_COLORS = {
    batalla: "#D32F2F",
    trampa: "#F57C00",
    evento: "#1976D2",
    nada: "#9E9E9E",
    visitado: "#43A047",
    jefe: "#D32F2F"
}

const EVENT_GLYPHS = {
    batalla: "⚔",
    trampa: "⚠",
    evento: "?",
    nada: "•",
    visitado: "✓",
    jefe: "⚔"
}

function mapEventForUI(ev) {
    // Mapear eventos del generador a la UI solicitada
    switch (ev) {
        case 'enemigo': return 'batalla'
        case 'trampa': return 'trampa'
        case 'evento': return 'evento'
        case 'ninguno': return 'nada'
        case 'jefe': return 'jefe'
        default: return 'nada'
    }
}

export class DcScene extends Phaser.Scene {
    constructor() {
        super({ key: "DcScene" })

        this.biome = 'mazmorra'
    }

    preload() {
        // Cargar estilos UI y fondos básicos necesarios para DOM/menús
        preload_textBox(this)
        preload_styleMenu(this)
        preload_dungeon(this)

        // Cargar DB de items para Inventario persistente
        this.load.json("accessory_db", "src/database/items/gear/db/accessory_db.json")
        this.load.json("armor_db", "src/database/items/gear/db/armor_db.json")
        this.load.json("weapon_db", "src/database/items/gear/db/weapon_db.json")
        this.load.json("shield_db", "src/database/items/gear/db/shield_db.json")
        this.load.json("consumable", "src/database/items/common/db/consumable.json")
        this.load.json("usable", "src/database/items/common/db/usable.json")
        this.load.json("misc", "src/database/items/common/db/misc.json")
    }

    create(data) {
        // UI base
        create_dialogContainer(this)
        create_textBox(this)
        create_npcImage(this)
        create_speakerNameBox(this)

        // Velocidad de tipeo para compatibilidad con showDialog()
        this.typingSpeed = CONFIG.TEXT.SPEED
        this.typingMultiplier = CONFIG.TEXT.FAST_MULTIPLIER

        // Persistencia de inventario (mismo patrón que VnScene)
        window.itemDB = {
            consumable: this.cache.json.get("consumable"),
            misc: this.cache.json.get("misc"),
            usable: this.cache.json.get("usable"),
            accessory: this.cache.json.get("accessory_db"),
            armor: this.cache.json.get("armor_db"),
            weapon: this.cache.json.get("weapon_db"),
            shield: this.cache.json.get("shield_db")
        }

        // Grupo de jugadores (hasta 3)
        this.player = data.player
        this.player2 = data.player2
        this.player3 = data.player3
        this.groupMembers = [this.player, this.player2, this.player3].filter(p => !!p)

        // Pool de cansancio compartido: 4 por miembro, min 4, máx 12
        this.fatigueMax = clamp(this.groupMembers.length * 4, 4, 12)
        this.fatigue = this.fatigueMax

        // Nivel base del dungeon por nivel del primer miembro (o 1)
        const levelBase = this.player?.level || 1

        // Generar mazmorra procedimental según reglas
        this.dungeon = buildDungeon({ level: levelBase, biome: this.biome })
        this.modules = this.dungeon.modules
        this.corridors = this.dungeon.corridors
        this.graph = this.dungeon.adj

        // Estado de exploración y visita
        this.visited = new Set([1])
        this.resolved = new Set() // módulos con evento resuelto
        this.exploredOnce = new Set() // exploración gastada

        // Posición actual en módulo (empieza en 1)
        this.current = { type: 'module', module: this.modules[0] }

        // Fondo inicial basado en el módulo
        const startKey = this.modules[0].image
        this.bg = this.add.image(this.scale.width / 2, this.scale.height / 2, startKey).setOrigin(0.5, 0.5)
        resize_bg(this)
        this.scale.on('resize', () => resize_bg(this))

        // Controles UI
        this._initMapControls()

        // Mostrar primera vista del módulo
        this._showModuleIntro(this.current.module)
    }

    _renderDungeonMenu() {
        const existing = document.getElementById('menuContainer')
        if (existing) existing.remove()

        const container = document.createElement('div')
        container.id = 'menuContainer'
        // Posición fija y centrada para evitar solapado superior
        container.style.position = 'absolute'
        container.style.left = '50%'
        container.style.bottom = '6%'
        container.style.transform = 'translateX(-50%)'
        container.style.background = 'rgba(0, 0, 0, 0.7)'
        container.style.padding = '15px'
        container.style.borderRadius = '6px'
        container.style.display = 'flex'
        container.style.gap = '12px'
        container.style.zIndex = '50'

        const add = (label, action) => {
            const btn = document.createElement('button')
            btn.textContent = label
            btn.dataset.action = action
            btn.onclick = () => {
                const a = btn.dataset.action
                // Al abrir cualquier submenú, ocultamos el menú principal
                const men = document.getElementById('menuContainer')
                if (men) men.remove()
                if (a === 'explore') {
                    this._handleExplore()
                }
                else if (a === 'travel') {
                    this._openTravel()
                }
                else if (a === 'inventory') {
                    showInventoryMenu(this, this.player, { onBack: () => this._renderDungeonMenu() })
                }
                else if (a === 'status') {
                    this._openStatusTabs()
                }
                else if (a === 'quests') {
                    showQuestLog(this, this.player, { onBack: () => this._renderDungeonMenu() })
                }
            }
            container.appendChild(btn)
        }

        add('?? Exploración', 'explore')
        add('??? Viajar', 'travel')
        add('?? Inventario', 'inventory')
        add('?? Estado', 'status')
        add('? Misiones', 'quests')

        this.dialogContainer.appendChild(container)
    }

    _openStatusTabs() {
        // Contenedor simple con pestañas de hasta 3 miembros reutilizando showStatusCards
        const wrap = document.createElement('div')
        wrap.id = 'inventoryMenuContainer'

        const header = document.createElement('div')
        header.id = 'inventoryHeader'
        header.textContent = 'Estado del Grupo'
        wrap.appendChild(header)

        const tabs = document.createElement('div')
        tabs.id = 'inventoryTabBar'

        const members = this.groupMembers
        const content = document.createElement('div')
        content.id = 'inventoryContent'

        const openFor = (idx) => {
            // Reutilizamos showStatusCards, que toma scene.player, así que lo reasignamos temporalmente
            const original = this.player
            this.player = members[idx]
            wrap.remove()
            showStatusCards(this, { onBack: () => { this.player = original; this._openStatusTabs() } })
        }

        members.forEach((p, i) => {
            const b = document.createElement('button')
            b.textContent = p?.name || `Miembro ${i+1}`
            b.onclick = () => openFor(i)
            tabs.appendChild(b)
        })

        wrap.appendChild(tabs)

        // Footer con volver
        const footer = document.createElement('div')
        footer.id = 'inventoryFooter'
        const backBtn = document.createElement('button')
        backBtn.textContent = 'Volver'
        backBtn.onclick = () => {
            wrap.remove()
            this._renderDungeonMenu()
        }
        footer.appendChild(backBtn)
        wrap.appendChild(content)
        wrap.appendChild(footer)

        this.dialogContainer.appendChild(wrap)
    }

    _openTravel() {
        // Construir conexiones visibles desde el m�dulo actual (fog of war + secretos revelados)
        if (this.current.type !== 'module') return
        const module = this.current.module

        const conns = []
        for (const toId of (this.graph[module.id] || [])) {
            const corridor = this._findCorridor(module.id, toId)
            if (!corridor) continue
            // Respetar pasillos secretos: s�lo si revealed
            if (corridor.hidden && !corridor.revealed) continue

            const toModule = this.modules[toId - 1]
            conns.push({
                type: 'module',
                fromModule: module,
                toModule: toModule,
                corridor: corridor
            })
        }

        if (conns.length === 0) {
            this._toast('No hay rutas disponibles desde aqui.')
            return
        }

        showMovementMenu(this, { type: 'module', module, connections: conns }, {}, (option) => {
            if (option === 'volver') {
                this._renderDungeonMenu()
                return
            }
            if (option?.type === 'module' && option.toModule) {
                this._moveToModule(option.toModule, option.corridor)
            }

            if (option?.type === 'module' && option.toModule) {
                this._moveToModule(option.toModule, option.corridor)
            }
        })
    }

    _moveToModule(nextModule, viaCorridor) {
        // Marcar visitado, actualizar posición, y refrescar UI
        this.current = { type: 'module', module: nextModule }
        this.visited.add(nextModule.id)
        // Si pasillo tiene eventos, no los resolvemos automáticos aquí; se resuelven al ejecutar eventos
        this._refreshMapOverlayIfOpen()
        this._showModuleIntro(nextModule)
    }

    _handleExplore() {
        const at = (this.current.type === 'module') ? this.current.module : null
        if (!at) return
        if (this.exploredOnce.has(at.id)) {
            // Solo una vez por módulo
            this._toast("Ya has explorado este módulo.")
            return
        }
        if (this.fatigue <= 0) {
            this._toast("Estás demasiado cansado para explorar.")
            return
        }

        this.fatigue -= 1
        this.exploredOnce.add(at.id)

        // Revela secretos del módulo y detecta evento narrativo
        let foundSomething = false

        // Revelar pasillos secretos conectados a este módulo
        this.corridors.forEach(c => {
            if ((c.from === at.id || c.to === at.id) && c.hidden && !c.revealed) {
                c.revealed = true
                foundSomething = true
            }
        })

        const evUI = mapEventForUI(at.event)
        if (evUI === 'evento' && !this.resolved.has(at.id)) {
            foundSomething = true
            // Aquí podríamos disparar narrativa / cofres / trampas especiales
            this._toast("Has encontrado algo interesante.")
        }

        if (!foundSomething) {
            this._toast("No encuentras nada relevante.")
        }

        this._refreshMapOverlayIfOpen()
        this._renderDungeonMenu()
    }

    _showModuleIntro(mod) {
        // Configura di�logo de narrativa del m�dulo y usa su fondo
        const evUI = mapEventForUI(mod.event)
        const status = this.resolved.has(mod.id) ? 'visitado' : evUI
        const color = EVENT_COLORS[status] || '#9E9E9E'

        this.dialogs = [{
            text: [mod.bio],
            speakerName: 'Narrador',
            image: '',
            background: mod.image
        }]
        this.currentIndex = 0

        // Primero texto; al terminar, mostrar menú
        const existingMenu = document.getElementById('menuContainer')
        if (existingMenu) existingMenu.remove()
        this.events.once('dialogComplete', () => {
            this._renderDungeonMenu()
        })

        showDialog(this)
    }

    _findCorridor(a, b) {
        return this.corridors.find(c => (c.from === a && c.to === b) || (c.from === b && c.to === a))
    }

    _visibleSet() {
        // Fog of war: módulos visitados y adyacentes al actual
        const visible = new Set([...this.visited])
        if (this.current.type === 'module') {
            const id = this.current.module.id
            for (const v of (this.graph[id] || [])) {
                const cor = this._findCorridor(id, v)
                if (cor && (!cor.hidden || cor.revealed)) visible.add(v)
            }
        }
        return visible
    }

    _renderLegend(parentEl) {
        let legend = document.getElementById('dcLegend')
        if (legend) legend.remove()

        legend = document.createElement('div')
        legend.id = 'dcLegend'
        legend.style.position = 'relative'
        legend.style.background = 'rgba(0,0,0,0.6)'
        legend.style.color = '#fff'
        legend.style.padding = '12px 12px'
        legend.style.border = '2px solid rgba(0,0,0,0.6)'
        legend.style.borderRadius = '6px'
        legend.style.fontSize = '16px'
        legend.style.lineHeight = '18px'
        legend.style.userSelect = 'none'
        legend.style.height = 'fit-content'

        const row = (label, color, glyph) => {
            const r = document.createElement('div')
            r.style.display = 'flex'
            r.style.alignItems = 'center'
            r.style.gap = '26px'
            const dot = document.createElement('div')
            dot.style.width = '24px'
            dot.style.height = '24px'
            
            dot.style.background = color
            dot.style.border = '2px solid rgba(0,0,0,0.6)'
            dot.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.4)'
            dot.style.display = 'flex'
            dot.style.alignItems = 'center'
            dot.style.borderRadius = '6px'
            dot.style.justifyContent = 'center'
            dot.style.fontSize = '24px'
            dot.style.margin = '6px 0 6px 0'
            dot.textContent = glyph
            const span = document.createElement('span')
            span.textContent = label
            r.appendChild(dot); r.appendChild(span)
            return r
        }

        legend.appendChild(row('Batalla', EVENT_COLORS.batalla, EVENT_GLYPHS.batalla))
        legend.appendChild(row('Trampa', EVENT_COLORS.trampa, EVENT_GLYPHS.trampa))
        legend.appendChild(row('Evento', EVENT_COLORS.evento, EVENT_GLYPHS.evento))
        legend.appendChild(row('Nada', EVENT_COLORS.nada, EVENT_GLYPHS.nada))
        legend.appendChild(row('Visitado', EVENT_COLORS.visitado, EVENT_GLYPHS.visitado))




        ;(parentEl || this.dialogContainer).appendChild(legend)
    }

    _renderMinimap(parentEl) {
        // Mapa completo con pasillos como rect�ngulos conectores
        let map = document.getElementById('dcMinimap')
        if (map) map.remove()

        map = document.createElement('div')
        map.id = 'dcMinimap'
        map.style.position = 'relative'
        map.style.width = '380px'
        map.style.height = '240px'
        
        map.style.background = 'rgba(0,0,0,0.4)'
        map.style.border = '2px solid rgba(0,0,0,0.5)'
        map.style.borderRadius = '16px'
        map.style.padding = '4px'
        map.style.userSelect = 'none'

        const outlineW = this._highContrast ? 3 : 2
        const haloAlpha = this._highContrast ? 0.6 : 0.4

        // Layout por capas (BFS)
        const dist = {}
        const layers = {}
        const q = [1]
        dist[1] = 0
        while (q.length) {
            const u = q.shift()
            const du = dist[u]
            layers[du] = layers[du] || []
            layers[du].push(u)
            for (const v of (this.graph[u] || [])) {
                if (dist[v] == null) { dist[v] = du + 1; q.push(v) }
            }
        }

        const columns = Object.keys(layers).map(k => parseInt(k, 10)).sort((a,b)=>a-b)
        const W = 380 - 16
        const H = 240 - 16
        const colCount = Math.max(1, columns.length)
        const colGap = W / (colCount + 1)

        const pos = {}
        columns.forEach((colIdx, i) => {
            const group = layers[colIdx]
            const rowCount = group.length
            const rowGap = H / (rowCount + 1)
            group.forEach((id, r) => {
                const x = 8 + (i + 1) * colGap
                const y = 8 + (r + 1) * rowGap
                pos[id] = { x, y }
            })
        })

        const addCorridor = (fromId, toId) => {
            const a = pos[fromId], b = pos[toId]
            if (!a || !b) return
            const dx = b.x - a.x
            const dy = b.y - a.y
            const len = Math.sqrt(dx*dx + dy*dy)
            const angle = Math.atan2(dy, dx) * 180 / Math.PI
            const midx = (a.x + b.x) / 2
            const midy = (a.y + b.y) / 2
            const bar = document.createElement('div')
            bar.style.position = 'absolute'
            bar.style.left = `${midx - len / 2}px`
            bar.style.top = `${midy - 3}px`
            bar.style.width = `${Math.max(6, Math.floor(len))}px`
            bar.style.height = '3px'
            bar.style.background = '#9E9E9E'
            bar.style.border = `${outlineW}px solid rgba(0,0,0,0.6)`
            bar.style.boxShadow = `0 0 0 4px rgba(255,255,255,${haloAlpha})`
            bar.style.transformOrigin = 'center center'
            bar.style.transform = `rotate(${angle}deg)`
            bar.title = `Pasillo: ${fromId} ? ${toId}`
            map.appendChild(bar)
        }

        for (const c of this.corridors) {
            const a = Math.min(c.from, c.to)
            const b = Math.max(c.from, c.to)
            addCorridor(a, b)
        }

        const addNode = (m) => {
            const p = pos[m.id] || { x: 16, y: 16 }
            const x = p.x, y = p.y
            const evUI = mapEventForUI(m.event)
            const isVisited = this.visited.has(m.id)
            const status = isVisited || this.resolved.has(m.id) ? 'visitado' : evUI
            const color = EVENT_COLORS[status]
            const glyph = (isVisited || this.resolved.has(m.id)) ? EVENT_GLYPHS.visitado : EVENT_GLYPHS[evUI]
            const node = document.createElement('div')
            node.style.position = 'absolute'
            node.style.left = `${x - 7}px`
            node.style.top = `${y - 7}px`
            node.style.width = '20px'
            node.style.height = '20px'
            node.style.background = color
            node.style.border = `${outlineW}px solid rgba(0,0,0,0.6)`
            node.style.boxShadow = `0 0 0 3px rgba(255,255,255,${haloAlpha})`
            node.style.borderRadius = '4px'
            node.style.display = 'flex'
            node.style.alignItems = 'center'
            node.style.justifyContent = 'center'
            node.style.color = '#fff'
            node.style.fontWeight = '700'
            node.style.fontSize = '20px'
            node.title = `Módulo ${m.id}: ${evUI}`
            node.textContent = glyph
            map.appendChild(node)
        }

        this.modules.forEach(m => addNode(m))

        ;(parentEl || this.dialogContainer).appendChild(map)
    }

    _initMapControls() {
        const existingBtn = document.getElementById('dcMapButton')
        if (existingBtn) existingBtn.remove()

        const btn = document.createElement('button')
        btn.id = 'dcMapButton'
        btn.textContent = 'Mapa'
        btn.style.position = 'absolute'
        btn.style.top = '4%'
        btn.style.left = '4%'
        btn.style.zIndex = '60'
        btn.style.padding = '8px 12px'
        btn.style.border = '2px solid black'
        btn.style.borderRadius = '6px'
        btn.style.background = 'rgba(255,255,255,0.85)'
        btn.onclick = () => this._openMapOverlay()
        this.dialogContainer.appendChild(btn)
    }

    _openMapOverlay() {
        const btn = document.getElementById('dcMapButton')
        if (btn) btn.style.display = 'none'

        const prev = document.getElementById('dcMapOverlay')
        if (prev) prev.remove()

        const overlay = document.createElement('div')
        overlay.id = 'dcMapOverlay'
        overlay.style.position = 'absolute'
        overlay.style.left = '50%'
        overlay.style.top = '50%'
        overlay.style.transform = 'translate(-50%, -50%)'
        overlay.style.background = 'rgba(0,0,0,0.6)'
        overlay.style.border = '2px solid rgba(0,0,0,0.7)'
        overlay.style.borderRadius = '10px'
        overlay.style.padding = '12px'
        overlay.style.zIndex = '70'

        const header = document.createElement('div')
        header.style.display = 'flex'
        header.style.justifyContent = 'flex-end'
        header.style.marginBottom = '8px'
        const close = document.createElement('button')
        close.textContent = '✕'
        close.style.border = '2px solid black'
        close.style.borderRadius = '6px'
        close.style.background = 'rgba(255,255,255,0.85)'
        close.style.padding = '4px 8px'
        close.onclick = () => this._closeMapOverlay()
        header.appendChild(close)
        overlay.appendChild(header)

        const body = document.createElement('div')
        body.id = 'dcMapBody'
        body.style.display = 'flex'
        body.style.gap = '12px'
        body.style.alignItems = 'center'
        body.style.justifyContent = 'center'

        this._renderMinimap(body)
        this._renderLegend(body)

        overlay.appendChild(body)
        this.dialogContainer.appendChild(overlay)
    }

    _closeMapOverlay() {
        const overlay = document.getElementById('dcMapOverlay')
        if (overlay) overlay.remove()
        const btn = document.getElementById('dcMapButton')
        if (btn) btn.style.display = 'block'
    }

    _refreshMapOverlayIfOpen() {
        const body = document.getElementById('dcMapBody')
        if (!body) return
        const oldMap = document.getElementById('dcMinimap')
        if (oldMap) oldMap.remove()
        const oldLegend = document.getElementById('dcLegend')
        if (oldLegend) oldLegend.remove()
        this._renderMinimap(body)
        this._renderLegend(body)
    }

    _toast(text) {
        const id = 'dcToast'
        const prev = document.getElementById(id)
        if (prev) prev.remove()
        const d = document.createElement('div')
        d.id = id
        d.style.position = 'absolute'
        d.style.left = '50%'
        d.style.top = '10%'
        d.style.transform = 'translateX(-50%)'
        d.style.background = 'rgba(0,0,0,0.8)'
        d.style.border = '2px solid rgba(0,0,0,0.6)'
        d.style.borderRadius = '6px'
        d.style.padding = '8px 12px'
        d.style.color = '#fff'
        d.style.zIndex = '9999'
        d.textContent = text
        this.dialogContainer.appendChild(d)
        setTimeout(() => { const el = document.getElementById(id); if (el) el.remove() }, 1500)
    }
}

export default DcScene







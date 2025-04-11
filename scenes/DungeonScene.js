import CONFIG from "../config/config.js"
import { preload_dungeon, preload_textBox, preload_styleMenu, preload_enemies_crypt, preload_idle_characters } from "../config/preload.js"
import { create_dialogContainer, create_textBox } from "../config/create.js"
import { resize_bg } from "../config/dialogs.js"
import { generateDungeon } from "../src/database/exploration/dungeon_generator.js"
import { showMenu, showMovementMenu } from "../config/menus.js"
import { createHUD } from "../config/hud.js"

export class DungeonScene extends Phaser.Scene {
    constructor () {
        super({ key: "DungeonScene" })
        this.currentDialogues = null
        this.currentDialogueIndex = 0
        this.navigationMode = 'module' // 'module' o 'corridor'
        this.currentCorridor = null
        this.corridorPartIndex = 0
        this.currentTargetModuleId = null
        this.corridorDirection = 1 // 1: avance normal, -1: inverso
    }

    preload () {
        preload_dungeon(this)

        preload_textBox(this)
        preload_styleMenu(this)
        preload_idle_characters(this)
        preload_enemies_crypt(this)

        console.log("Iniciando precarga de assets")
    }

    create (data) {
        window.monsterDB = this.cache.json.get('monster_db')
        
        if (data && data.player) {
            this.player = data.player
            this.player2 = data.player2
            this.player3 = data.player3

            this.groupMembers = [this.player, this.player2, this.player3].filter(Boolean)
        }
        else {
            console.warn("No se recibieron datos de jugadores desde VnScene.")
        }

        create_dialogContainer(this)
        create_textBox(this)

        this.scale.on('resize', () => resize_bg(this))

        const charLevel = 1 //placeholder
        const zone = "mazmorra" //placeholder

        const dungeon = generateDungeon(charLevel, zone)

        console.log("Mazmorra generada:", dungeon)

        // Cadena principal aumentada para recorrer de principio a fin
        const mainRouteCount = 10
        let currentModule = dungeon.modules[0]

        // Grafo de conexiones: cada módulo apunta a sus pasillos conectados
        const graph = {}
        dungeon.modules.forEach(module => {
            graph[module.id] = []
        })

        dungeon.corridors.forEach(corridor => {
            graph[corridor.from].push({ corridor: corridor, to: corridor.to })
            graph[corridor.to].push({ corridor: corridor, to: corridor.from })
        })

        const modulesDict = {}
        dungeon.modules.forEach(module => {
            modulesDict[module.id] = module
        })

        // Historial de módulos visitados
        const moduleHistory = [currentModule.id]

        // Posiciones para el mapa de nodos (fijo, definido en la generación)
        const nodeSize = 20, startX = 100, startY = 300, spacingX = 100, branchOffsetY = 100
        const modulePositions = {}

        dungeon.modules.forEach(module => {
            if (module.id <= mainRouteCount) {
                modulePositions[module.id] = { x: startX + (module.id - 1) * spacingX, y: startY }
            }
            else {
                let corridor = dungeon.corridors.find(c => c.to === module.id) || dungeon.corridors.find(c => c.from === module.id)
                if (corridor) {
                    let parentId = (corridor.to === module.id) ? corridor.from : corridor.to
                    let parentPos = modulePositions[parentId] || { x: startX, y: startY }
                    modulePositions[module.id] = module.isDeadEnd
                        ? { x: parentPos.x, y: parentPos.y + branchOffsetY }
                        : { x: parentPos.x, y: parentPos.y - branchOffsetY }
                }
                else {
                    modulePositions[module.id] = { x: startX, y: startY }
                }
            }
        })

        // Objeto graphics para el mapa (por defecto oculto)
        this.mapGraphics = this.add.graphics()
        this.mapGraphics.visible = false

        // Actualiza la imagen de fondo; si es un pasillo, usa la imagen del segmento actual
        const updateBackground = (node) => {
            let img

            if (node.images) {
                img = node.images[Math.min(this.corridorPartIndex, node.images.length - 1)]
            }
            else {
                img = node.image
            }

            console.log(img)

            if (!this.bg) {
                this.bg = this.add.image(640, 360, img).setOrigin(0.5, 0.5)
            }
            else {
                if (this.bg.texture.key !== img) {
                    this.bg.setTexture(img)
                }
            }

            this.bg.setDepth(0)
            this.mapGraphics.setDepth(1)

            resize_bg(this)
        }

        // Inicia el diálogo de un módulo
        const startDialogue = (module) => {
            this.currentDialogues = [module.bio]

            if (module.hasSecretEntrance && module.secretHint) {
                this.currentDialogues.push(module.secretHint)
            }

            this.currentDialogueIndex = 0
            this.textboxText.innerHTML = this.currentDialogues[this.currentDialogueIndex]

            if (this.dialogContainer) {
                this.dialogContainer.style.display = "block"
            }
        }

        const hideDialogueContainer = () => {
            if (this.dialogContainer) {
                this.dialogContainer.style.display = "none"
            }
        }

        updateBackground(currentModule)
        startDialogue(currentModule)

        // Dibuja el mapa de nodos: se muestran los módulos visitados y, si estamos en pasillo, éste
        const drawMap = () => {
            this.mapGraphics.clear()

            // Dibujar pasillos: sólo si ambos extremos han sido visitados o es el pasillo actual
            dungeon.corridors.forEach(corridor => {
                if ((moduleHistory.includes(corridor.from) && moduleHistory.includes(corridor.to)) ||
                    (this.navigationMode === 'corridor' && this.currentCorridor === corridor)) {
                    const posFrom = modulePositions[corridor.from]
                    const posTo = modulePositions[corridor.to]
                    const dx = posTo.x - posFrom.x
                    const dy = posTo.y - posFrom.y
                    const totalLength = Math.sqrt(dx * dx + dy * dy)
                    const ux = dx / totalLength
                    const uy = dy / totalLength
                    const perpX = -uy * 3
                    const perpY = ux * 3

                    // Dibujar cada segmento
                    for (let i = 0; i < corridor.parts.length; i++) {
                        let segColor = 0x888888
                        const eventType = corridor.parts[i].event

                        if (eventType === 'enemigo') {
                            segColor = 0xff5555
                        }
                        else if (eventType === 'trampa') {
                            segColor = 0xffaa00
                        }
                        else if (eventType === 'evento') {
                            segColor = 0xaa00ff
                        }

                        if (this.navigationMode === 'corridor' && this.currentCorridor === corridor && i === this.corridorPartIndex) {
                            segColor = 0x00ff80
                        }

                        const startRatio = i / corridor.parts.length
                        const endRatio = (i + 1) / corridor.parts.length
                        const startXSeg = posFrom.x + dx * startRatio
                        const startYSeg = posFrom.y + dy * startRatio
                        const endXSeg = posFrom.x + dx * endRatio
                        const endYSeg = posFrom.y + dy * endRatio
                        const points = [
                            new Phaser.Geom.Point(startXSeg + perpX, startYSeg + perpY),
                            new Phaser.Geom.Point(endXSeg + perpX, endYSeg + perpY),
                            new Phaser.Geom.Point(endXSeg - perpX, endYSeg - perpY),
                            new Phaser.Geom.Point(startXSeg - perpX, startYSeg - perpY)
                        ]

                        this.mapGraphics.fillStyle(segColor, 1)
                        this.mapGraphics.fillPoints(points, true)
                    }
                }
            })

            // Dibujar nodos: sólo los módulos visitados y el actual
            moduleHistory.forEach(id => {
                const pos = modulePositions[id]
                let color = 0xffff00 // color de visitado

                if (id === currentModule.id) {
                    color = 0x00ff00 // actual
                }

                this.mapGraphics.fillStyle(color, 1)
                this.mapGraphics.fillRect(pos.x - nodeSize / 2, pos.y - nodeSize / 2, nodeSize, nodeSize)
            })
        }



        // MENÚ PRINCIPAL DE DUNGEON (Movimiento)
        const showDungeonMainMenu = () => {
            // Ocultar la textbox y eliminar menú previo
            hideDialogueContainer()

            const existingMenu = document.getElementById('menuContainer')

            if (existingMenu) existingMenu.remove()

            showMenu(["Movimiento", "Exploración", "Inventario", "Estado"], (option) => {
                switch (option) {
                    case "Movimiento":
                        // Mostrar el menú de movimiento y el mapa; se oculta el mapa al iniciar el viaje
                        this.mapGraphics.visible = true
                        drawMap()

                        let currentNode = {}

                        if (this.navigationMode === 'module') {
                            let connections = graph[currentModule.id] || []

                            if (currentModule.id > 1) {
                                let prevConn = connections.find(conn => conn.to === currentModule.id - 1)

                                if (prevConn) {
                                    currentNode.prev = { type: 'corridor', corridor: prevConn.corridor, fromModule: modulesDict[currentModule.id], toModule: modulesDict[prevConn.to] }
                                }
                            }

                            if (currentModule.id < mainRouteCount) {
                                let nextConn = connections.find(conn => conn.to === currentModule.id + 1)

                                if (nextConn) {
                                    currentNode.next = { type: 'corridor', corridor: nextConn.corridor, fromModule: modulesDict[currentModule.id], toModule: modulesDict[nextConn.to] }
                                }
                            }

                            if (!currentNode.prev && !currentNode.next) {
                                alert("No hay pasillos disponibles desde este módulo")
                                showDungeonMainMenu()
                                return
                            }
                        }
                        else if (this.navigationMode === 'corridor') {
                            currentNode = { type: 'corridor', corridor: this.currentCorridor, partIndex: this.corridorPartIndex, fromModule: modulesDict[this.currentCorridor.from], toModule: modulesDict[this.currentCorridor.to] }
                        }

                        const handleMovementSelection = (selection) => {
                            // Ocultar el mapa al iniciar el viaje
                            this.mapGraphics.visible = false

                            if (selection === "volver") {
                                showDungeonMainMenu()
                            }
                            else if (selection.type === 'corridor') {
                                if (this.navigationMode === 'module') {
                                    // Entrar al pasillo seleccionado
                                    this.navigationMode = 'corridor'
                                    this.currentCorridor = selection.corridor

                                    if (selection.toModule.id < currentModule.id) {
                                        this.corridorDirection = -1
                                        this.corridorPartIndex = this.currentCorridor.parts.length - 1
                                    }
                                    else {
                                        this.corridorDirection = 1
                                        this.corridorPartIndex = 0
                                    }

                                    this.currentTargetModuleId = selection.toModule.id

                                    updateBackground(this.currentCorridor)
                                    this.textboxText.innerHTML = `Pasillo parte ${this.corridorPartIndex + 1} de ${this.currentCorridor.parts.length}`

                                    // Revisar evento del segmento
                                    let seg = this.currentCorridor.parts[this.corridorPartIndex]

                                    if (seg.event !== 'ninguno') {
                                        console.log("Evento en pasillo:", seg.event)
                                        // Aquí se llama a la batalla o evento
                                    }

                                    drawMap()
                                    showDungeonMainMenu()
                                }
                                else if (this.navigationMode === 'corridor') {
                                    if (selection.move === 'prev') {
                                        if (this.corridorDirection === 1) {
                                            if (this.corridorPartIndex > 0) {
                                                this.corridorPartIndex--
                                                this.textboxText.innerHTML = `Pasillo parte ${this.corridorPartIndex + 1} de ${this.currentCorridor.parts.length}`
                                            }
                                            else {
                                                currentModule = modulesDict[this.currentCorridor.from]
                                                this.navigationMode = 'module'
                                                updateBackground(currentModule)
                                                startDialogue(currentModule)
                                                this.corridorPartIndex = 0
                                                this.currentCorridor = null
                                            }
                                        }
                                        else {
                                            if (this.corridorPartIndex < this.currentCorridor.parts.length - 1) {
                                                this.corridorPartIndex++
                                                this.textboxText.innerHTML = `Pasillo parte ${this.corridorPartIndex + 1} de ${this.currentCorridor.parts.length}`
                                            }
                                            else {
                                                currentModule = modulesDict[this.currentCorridor.from]
                                                this.navigationMode = 'module'
                                                updateBackground(currentModule)
                                                startDialogue(currentModule)
                                                this.corridorPartIndex = 0
                                                this.currentCorridor = null
                                            }
                                        }
                                        drawMap()
                                        showDungeonMainMenu()
                                    }
                                    else if (selection.move === 'next') {
                                        if (this.corridorDirection === 1) {
                                            if (this.corridorPartIndex < this.currentCorridor.parts.length - 1) {
                                                this.corridorPartIndex++
                                                this.textboxText.innerHTML = `Pasillo parte ${this.corridorPartIndex + 1} de ${this.currentCorridor.parts.length}`
                                            }
                                            else {
                                                currentModule = modulesDict[this.currentCorridor.to]
                                                if (!moduleHistory.includes(currentModule.id)) {
                                                    moduleHistory.push(currentModule.id)
                                                }
                                                this.navigationMode = 'module'
                                                this.corridorPartIndex = 0
                                                this.currentCorridor = null
                                                updateBackground(currentModule)
                                                startDialogue(currentModule)
                                            }
                                        }
                                        else {
                                            if (this.corridorPartIndex > 0) {
                                                this.corridorPartIndex--
                                                this.textboxText.innerHTML = `Pasillo parte ${this.corridorPartIndex + 1} de ${this.currentCorridor.parts.length}`
                                            }
                                            else {
                                                currentModule = modulesDict[this.currentCorridor.to]
                                                if (!moduleHistory.includes(currentModule.id)) {
                                                    moduleHistory.push(currentModule.id)
                                                }
                                                this.navigationMode = 'module'
                                                this.corridorPartIndex = 0
                                                this.currentCorridor = null
                                                updateBackground(currentModule)
                                                startDialogue(currentModule)
                                            }
                                        }
                                        drawMap()
                                        showDungeonMainMenu()
                                    }
                                    else {
                                        console.log(`Intentando cambiar al módulo: ${this.currentCorridor.to}`)
                                        if (!modulesDict[this.currentCorridor.to]) {
                                            console.error(`Error: El módulo destino (${this.currentCorridor.to}) no está definido en modulesDict.`)
                                            alert(`Error crítico: El módulo destino (${this.currentCorridor.to}) no se encuentra.`)
                                            return
                                        }
                                        currentModule = modulesDict[this.currentCorridor.to]
                                        console.log(`Módulo actualizado: ${currentModule.id}, Nombre: ${currentModule.name || 'Sin nombre'}`)
                                        if (!moduleHistory.includes(currentModule.id)) {
                                            moduleHistory.push(currentModule.id)
                                        }
                                        this.navigationMode = 'module'
                                        this.corridorPartIndex = 0
                                        this.currentCorridor = null
                                        if (!currentModule.background) {
                                            console.warn(`Advertencia: El módulo ${currentModule.id} no tiene fondo definido.`)
                                        }
                                        updateBackground(currentModule)
                                        startDialogue(currentModule)
                                        console.log(`Diálogo iniciado en módulo ${currentModule.id}`)
                                        drawMap()
                                        setTimeout(() => {
                                            showDungeonMainMenu()
                                        }, 100)
                                    }
                                }
                            }
                            else if (selection.type === 'module') {
                                currentModule = selection.module
                                if (!moduleHistory.includes(currentModule.id)) {
                                    moduleHistory.push(currentModule.id)
                                }
                                this.navigationMode = 'module'
                                updateBackground(currentModule)
                                startDialogue(currentModule)
                                drawMap()
                                showDungeonMainMenu()
                            }
                        }

                        showMovementMenu(this.navigationMode === 'module'
                            ? { module: currentModule, prev: currentNode.prev, next: currentNode.next }
                            : { type: 'corridor', corridor: this.currentCorridor, partIndex: this.corridorPartIndex, fromModule: modulesDict[this.currentCorridor.from], toModule: modulesDict[this.currentCorridor.to] }
                        , modulePositions, handleMovementSelection)
                        break

                    case "Exploración":
                        console.log("Exploración iniciada (fatiga consumida)")
                        break

                    case "Inventario":
                        console.log("Inventario no implementado aún.")
                        break

                    case "Estado":
                        console.log("Estado no implementado aún.")
                        break

                    default:
                        break
                }
            })
        }

        // Avanzar diálogos con "Z"
        this.input.keyboard.on("keydown-Z", () => {
            if (this.navigationMode === 'module') {
                if (this.currentDialogues && this.currentDialogueIndex < this.currentDialogues.length - 1) {
                    this.currentDialogueIndex++
                    this.textboxText.innerHTML = this.currentDialogues[this.currentDialogueIndex]
                }
                else if (this.currentDialogues) {
                    hideDialogueContainer()
                    this.currentDialogues = null
                    this.currentDialogueIndex = 0
                    showDungeonMainMenu()
                }
            }
        })

        createHUD(this)
    }

    createEnemy(monsterKey) {
        // Se asume que window.monsterDB existe y tiene la estructura:
        // window.monsterDB.monster[monsterKey] = { name, image, hp, atk, scale, ... }
        let monster = window.monsterDB &&
                      window.monsterDB.monster &&
                      window.monsterDB.monster[monsterKey]
        if (!monster) {
            console.error(`No se encontró el monstruo: ${monsterKey}`)
            return null
        }
        // Clonar el objeto para no modificar la base de datos
        return JSON.parse(JSON.stringify(monster))
    }

    startBattle(enemies) {
        // Asegurarse de que 'enemies' sea un array
        if (!Array.isArray(enemies)) {
            enemies = [enemies]
        }
        this.enemies = enemies
        this.enemyBattleImages = []
        this.enemyHealthBars = []
    
        // Crear contenedor de batalla
        if (!this.battleContainer) {
            this.battleContainer = this.add.dom(0, 0, 'div', null, '')

        }
        else {
            // Reiniciar contenedor si ya existe
            this.battleContainer.node.innerHTML = ''
        }
    

        this.enemies.forEach((enemy, index) => {
            enemy.maxHp = enemy.hp
            enemy.currentHp = enemy.hp
            const enemyScale = enemy.scale || 0.3
            const offsetY = enemy.offsetY || 0
            const enemyKey = enemy.image && enemy.image !== "null.webp"
                ? `/assets/enemies/${enemy.image}.webp`
                : `/assets/enemies/nightmareskeleton.webp`
        
            const enemyImage = this.add.dom(0, 0, 'img')
        
            enemyImage.node.src = enemyKey
            enemyImage.node.className = "battleEnemyImage"
            enemyImage.node.style.transform = `scale(${enemyScale})`
            enemyImage.enemy = enemy
        
            const pos = CONFIG.BATTLER_POSITIONS.enemy
            enemyImage.setPosition(pos.x, pos.y)
            enemyImage.node.style.marginTop = `${offsetY}px`
            this.battleContainer.node.appendChild(enemyImage.node)
            this.enemyBattleImages.push(enemyImage)
        
            let enemyHealthBar = this.add.graphics()
            this.enemyHealthBars.push({ enemy: enemy, graphics: enemyHealthBar, pos: { x: pos.x, y: pos.y - 80 } })
        })

        
        // Reinsertar la imagen de player2 para que se renderice por encima de los demás
        const targetEnemy = this.enemies[0]
        const enemy1Image = this.enemyBattleImages.find(img => img.enemy && img.enemy.id === targetEnemy.id)
        if (enemy1Image) {
            if (this.battleContainer.node.contains(enemy1Image.node)) {
                this.battleContainer.node.removeChild(enemy1Image.node)
            }
            this.battleContainer.node.appendChild(enemy1Image.node)
        }

        // Crear imágenes y barras de vida para los aliados
        this.playerBattleImages = []
        this.playerHealthBars = []
        const allies = this.groupMembers || []
        const playerPositions = [
            CONFIG.BATTLER_POSITIONS.player,
            CONFIG.BATTLER_POSITIONS.player2,
            CONFIG.BATTLER_POSITIONS.player3
        ]
        allies.forEach((ally, index) => {
            const imageKey = ally.battle_image ? `assets/characters/idle/${ally.battle_image}.webp` : 'assets/characters/idle/_idle.webp'
            let playerImage = this.add.dom(0, 0, 'img')
            playerImage.node.src = imageKey
            playerImage.node.className = "battlePlayerImage"
            playerImage.node.style.position = 'absolute'
            playerImage.member = ally
            let pos = playerPositions[index]
            playerImage.setPosition(pos.x, pos.y)

            // Agregar la imagen al contenedor de batalla
            this.battleContainer.node.appendChild(playerImage.node)
            this.playerBattleImages.push(playerImage)
            
            let allyHealthBar = this.add.graphics()
            let hbPos = { 
                x: CONFIG.HEALTHBAR_POSITIONS[`player${index+1}`]?.x || pos.x, 
                y: CONFIG.HEALTHBAR_POSITIONS[`player${index+1}`]?.y || (pos.y + 50) 
            }
            this.playerHealthBars.push({ member: ally, graphics: allyHealthBar, pos: hbPos })
        })

        // Reinsertar la imagen de player2 para que se renderice por encima de los demás
        if (this.player2) {
            const player2Image = this.playerBattleImages.find(img => img.member === this.player2)
            if (player2Image) {
                // Si el nodo ya está en el contenedor, lo removemos y lo volvemos a agregar
                if (this.battleContainer.node.contains(player2Image.node)) {
                    this.battleContainer.node.removeChild(player2Image.node)
                }
                this.battleContainer.node.appendChild(player2Image.node)
            }
        }
        
        
        this.scale.on('resize', () => { this.updateBattlePositions() })
        this.updateBattlePositions()
        this.drawBattleHealthBars()
        


        // Mostrar menú de batalla; se usa el primer enemigo como objetivo por defecto
        showBattleMenu(this, allies, this.enemies[0])
    }
    
    // Función para actualizar posiciones en batalla (al redimensionar, etc.)
    updateBattlePositions() {
        const baseWidth = CONFIG.SCREEN.WIDTH
        const baseHeight = CONFIG.SCREEN.HEIGHT
        const gameWidth = this.scale.gameSize.width || baseWidth
        const gameHeight = this.scale.gameSize.height || baseHeight
        const scaleX = gameWidth / baseWidth
        const scaleY = gameHeight / baseHeight
        

        this.enemyBattleImages.forEach((enemyImage, index) => {
            let posConfigKey = index === 0 ? 'enemy' : (index === 1 ? 'enemy2' : (index === 2 ? 'enemy3' : 'enemy'))
            let pos = CONFIG.BATTLER_POSITIONS[posConfigKey]
            enemyImage.setPosition(pos.x * scaleX, pos.y * scaleY)
            if (this.enemyHealthBars[index]) {
                let hbPos = CONFIG.HEALTHBAR_POSITIONS[posConfigKey]
                this.enemyHealthBars[index].pos = { x: hbPos.x * scaleX, y: hbPos.y * scaleY }
            }
        })




        // Actualizar posiciones de aliados
        const playerPositions = [
            CONFIG.BATTLER_POSITIONS.player,
            CONFIG.BATTLER_POSITIONS.player2,
            CONFIG.BATTLER_POSITIONS.player3
        ]
        this.playerBattleImages.forEach((playerImage, index) => {
            const pos = playerPositions[index]
            if (pos) {
                playerImage.setPosition(pos.x * scaleX, pos.y * scaleY)
                if (this.playerHealthBars[index]) {
                    const hbPos = { x: CONFIG.HEALTHBAR_POSITIONS[`player${index+1}`]?.x || pos.x, y: CONFIG.HEALTHBAR_POSITIONS[`player${index+1}`]?.y || (pos.y + 50) }
                    this.playerHealthBars[index].pos = { x: hbPos.x * scaleX, y: hbPos.y * scaleY }
                }
            }
        })
        
        this.drawBattleHealthBars()
    }
    
    // Función para dibujar las barras de salud en batalla
    drawBattleHealthBars() {
        const barWidth = 150
        const barHeight = 15
        
        // Dibujar barras de salud de aliados
        this.playerHealthBars.forEach(hbObj => {
            const { graphics, member, pos } = hbObj
            graphics.clear()
            const percentage = member.hp / member.hp_max
            graphics.fillStyle(0xff0000, 1)
            graphics.fillRect(pos.x - barWidth / 2, pos.y, barWidth, barHeight)
            graphics.fillStyle(0x00ff00, 1)
            graphics.fillRect(pos.x - barWidth / 2, pos.y, barWidth * percentage, barHeight)
        })
        
        // Dibujar barras de salud de enemigos
        this.enemyHealthBars.forEach(hbObj => {
            const { enemy, graphics, pos } = hbObj
            graphics.clear()
            const percentage = enemy.currentHp / enemy.maxHp
            graphics.fillStyle(0xff0000, 1)
            graphics.fillRect(pos.x - barWidth / 2, pos.y, barWidth, barHeight)
            graphics.fillStyle(0x00ff00, 1)
            graphics.fillRect(pos.x - barWidth / 2, pos.y, barWidth * percentage, barHeight)
            graphics.setDepth(100)
        })
    }
}

function showBattleMenu(scene, allies, targetEnemy) {
    const menuContainer = document.createElement('div')
    menuContainer.id = 'battleMenuContainer'
    const actions = ['Atacar', 'Defender', 'Habilidad', 'Objeto', 'Huir']
    actions.forEach(action => {
        let btn = document.createElement('button')
        btn.textContent = action
        btn.style.padding = '5px 10px'
        btn.onclick = () => {
            document.body.removeChild(menuContainer)
            handleBattleAction(scene, allies, targetEnemy, action)
        }
        menuContainer.appendChild(btn)
    })
    document.body.appendChild(menuContainer)
}

// Función para manejar las acciones en batalla
function handleBattleAction(scene, allies, targetEnemy, action) {
    console.log(`Acción seleccionada: ${action}`)
    // Ejemplo: Solo implementamos la acción de "Atacar"
    if (action === 'Atacar') {
        // Utilizamos el primer aliado como atacante
        const attacker = allies[0]
        const damage = attacker.total_atk || 10
        targetEnemy.currentHp -= damage
        if (targetEnemy.currentHp < 0) targetEnemy.currentHp = 0
    }
    // Se pueden implementar otras acciones: Defender, Habilidad, Objeto, Huir, etc.
    scene.drawBattleHealthBars()
    if (targetEnemy.currentHp > 0) {
        // Turno del enemigo: usar el primer enemigo como atacante
        const enemyDamage = targetEnemy.atk || 5
        // Aplicar daño a todos los aliados (o a un aliado en particular)
        allies.forEach(ally => {
            ally.hp -= enemyDamage
            if (ally.hp < 0) ally.hp = 0
        })
        scene.drawBattleHealthBars()
    }
    // Verificar condiciones de victoria o derrota
    if (targetEnemy.currentHp <= 0) {
        console.log('Enemigo derrotado')
        cleanupBattle(scene)
    }
    else if (allies.every(ally => ally.hp <= 0)) {
        console.log('Todos los aliados han sido derrotados')
        cleanupBattle(scene)
    }
    else {
        // Continuar con la batalla
        showBattleMenu(scene, allies, targetEnemy)
    }
}

// Función para limpiar la batalla y volver a la escena de mazmorras
function cleanupBattle(scene) {
    const menu = document.getElementById('battleMenuContainer')
    if (menu) {
        document.body.removeChild(menu)
    }
    if (scene.battleContainer) {
        scene.battleContainer.destroy()
        scene.battleContainer = null
    }
    scene.scene.start('DungeonScene', { player: scene.player })
}

function getRandomEnemyGroup(monsterDB, groupSize) {
    const keys = Object.keys(monsterDB.monster)
    const group = []
    for (let i = 0; i < groupSize; i++) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        group.push(JSON.parse(JSON.stringify(monsterDB.monster[randomKey])))
    }
    return group
}
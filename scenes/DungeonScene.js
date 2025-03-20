import CONFIG from "../config/config.js"
import { preload_dungeon, preload_textBox, preload_styleMenu } from "../config/preload.js"
import { create_dialogContainer, create_textBox } from "../config/create.js"
import { resize_bg } from "../config/dialogs.js"
import { generateDungeon } from "../src/database/exploration/dungeon_generator.js"
import { showMenu, showMovementMenu } from "../config/menus.js"
import { createHUD } from "../config/hud.js"

export class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: "DungeonScene" })
        this.currentDialogues = null
        this.currentDialogueIndex = 0
        this.navigationMode = 'module' // 'module' o 'corridor'
        this.currentCorridor = null
        this.corridorPartIndex = 0
        this.currentTargetModuleId = null
        this.corridorDirection = 1 // 1: avance normal, -1: inverso
    }

    preload() {
        preload_dungeon(this)
        preload_textBox(this)
        preload_styleMenu(this)

        console.log("Iniciando precarga de assets")
    


    }

    create(data) {
        if (data && data.player) {
            this.player = data.player
            this.player2 = data.player2
            this.player3 = data.player3

            this.groupMembers = [this.player, this.player2, this.player3].filter(Boolean)

        } else {
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
        dungeon.modules.forEach(module => { graph[module.id] = [] })

        dungeon.corridors.forEach(corridor => {
            graph[corridor.from].push({ corridor: corridor, to: corridor.to })
            graph[corridor.to].push({ corridor: corridor, to: corridor.from })

        })

        const modulesDict = {}
        dungeon.modules.forEach(module => { modulesDict[module.id] = module })

        // Historial de módulos visitados
        const moduleHistory = [currentModule.id]

        // Posiciones para el mapa de nodos (fijo, definido en la generación)
        const nodeSize = 20, startX = 100, startY = 300, spacingX = 100, branchOffsetY = 100
        const modulePositions = {}

        dungeon.modules.forEach(module => {
            if (module.id <= mainRouteCount) {
                modulePositions[module.id] = { x: startX + (module.id - 1) * spacingX, y: startY }

            } else {
                let corridor = dungeon.corridors.find(c => c.to === module.id) || dungeon.corridors.find(c => c.from === module.id)
                
                if (corridor) {
                    let parentId = (corridor.to === module.id) ? corridor.from : corridor.to
                    let parentPos = modulePositions[parentId] || { x: startX, y: startY }

                    modulePositions[module.id] = module.isDeadEnd 
                        ? { x: parentPos.x, y: parentPos.y + branchOffsetY }
                        : { x: parentPos.x, y: parentPos.y - branchOffsetY }

                } else {
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

            } else {
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
            this.currentDialogues = [ module.bio ]

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

                        } else if (eventType === 'trampa') {
                            segColor = 0xffaa00

                        } else if (eventType === 'evento') {
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
                this.mapGraphics.fillRect(pos.x - nodeSize/2, pos.y - nodeSize/2, nodeSize, nodeSize)
            })
        }

        // MENÚ PRINCIPAL DE DUNGEON (Movimiento)
        const showDungeonMainMenu = () => {
            // Ocultar la textbox y eliminar menú previo
            hideDialogueContainer()

            const existingMenu = document.getElementById('menuContainer')

            if (existingMenu) existingMenu.remove()

            showMenu(["Movimiento", "Exploración", "Inventario", "Estado"], (option) => {
                switch(option) {
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

                        } else if (this.navigationMode === 'corridor') {
                            currentNode = { type: 'corridor', corridor: this.currentCorridor, partIndex: this.corridorPartIndex, fromModule: modulesDict[this.currentCorridor.from], toModule: modulesDict[this.currentCorridor.to] }
                        
                        }

                        const handleMovementSelection = (selection) => {
                            // Ocultar el mapa al iniciar el viaje
                            this.mapGraphics.visible = false

                            if (selection === "volver") {
                                showDungeonMainMenu()

                            } else if (selection.type === 'corridor') {
                                if (this.navigationMode === 'module') {
                                    // Entrar al pasillo seleccionado
                                    this.navigationMode = 'corridor'
                                    this.currentCorridor = selection.corridor

                                    if (selection.toModule.id < currentModule.id) {
                                        this.corridorDirection = -1
                                        this.corridorPartIndex = this.currentCorridor.parts.length - 1

                                    } else {
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

                                } else if (this.navigationMode === 'corridor') {
                                    if (selection.move === 'prev') {
                                        if (this.corridorPartIndex > 0) {
                                            this.corridorPartIndex--
                                            this.textboxText.innerHTML = `Pasillo parte ${this.corridorPartIndex + 1} de ${this.currentCorridor.parts.length}`

                                            let seg = this.currentCorridor.parts[this.corridorPartIndex]

                                            if (seg.event !== 'ninguno') {
                                                console.log("Evento en pasillo:", seg.event)
                                            }

                                            drawMap()
                                            showDungeonMainMenu()

                                        } else {
                                            // Retroceder: actualizar currentModule al módulo origen
                                            currentModule = modulesDict[this.currentCorridor.from]
                                            this.navigationMode = 'module'

                                            updateBackground(currentModule)
                                            startDialogue(currentModule)

                                            drawMap()
                                            showDungeonMainMenu()
                                        
                                        }
                                    } else if (selection.move === 'next') {
                                        if (this.corridorPartIndex < this.currentCorridor.parts.length - 1) {
                                            // Avanzar al siguiente segmento del pasillo
                                            this.corridorPartIndex++;
                                            this.textboxText.innerHTML = `Pasillo parte ${this.corridorPartIndex + 1} de ${this.currentCorridor.parts.length}`;
                                    
                                            let seg = this.currentCorridor.parts[this.corridorPartIndex];
                                    
                                            if (seg.event !== 'ninguno') {
                                                console.log("Evento en pasillo:", seg.event);
                                            }
                                    
                                            drawMap();
                                            showDungeonMainMenu();
                                    
                                        } else {
                                            // **Final del pasillo: cambiar al módulo destino**
                                            console.log(`Transición de pasillo a módulo destino: ${this.currentCorridor.to}`);
                                    
                                            if (!modulesDict[this.currentCorridor.to]) {
                                                console.error("¡Error! Módulo destino no encontrado.");
                                                return; // Evita que el código siga ejecutándose con un módulo inválido
                                            }
                                    
                                            // **Actualizar currentModule correctamente**
                                            currentModule = modulesDict[this.currentCorridor.to];
                                    
                                            if (!moduleHistory.includes(currentModule.id)) {
                                                moduleHistory.push(currentModule.id);
                                            }
                                    
                                            // **Reiniciar navegación y asegurar coherencia**
                                            this.navigationMode = 'module';
                                            this.corridorPartIndex = 0; // Reseteamos el índice del pasillo
                                            this.currentCorridor = null; // Limpiamos el pasillo actual para evitar estados inconsistentes
                                    
                                            // **Actualizar entorno**
                                            updateBackground(currentModule);
                                            startDialogue(currentModule);
                                            drawMap();
                                    
                                            // **Asegurar que el menú principal de la mazmorra reaparece**
                                            setTimeout(() => {
                                                showDungeonMainMenu();
                                            }, 100); // Pequeño delay para evitar posibles bloqueos de renderizado
                                        }
                                    } else {
                                        // **Final del pasillo: cambiar al módulo destino**
                                        console.log(`Intentando cambiar al módulo: ${this.currentCorridor.to}`);
                                    
                                        if (!modulesDict[this.currentCorridor.to]) {
                                            console.error(`Error: El módulo destino (${this.currentCorridor.to}) no está definido en modulesDict.`);
                                            alert(`Error crítico: El módulo destino (${this.currentCorridor.to}) no se encuentra.`);
                                            return; // Evita continuar con una transición inválida
                                        }
                                    
                                        // **Actualizar currentModule correctamente**
                                        currentModule = modulesDict[this.currentCorridor.to];
                                    
                                        console.log(`Módulo actualizado: ${currentModule.id}, Nombre: ${currentModule.name || 'Sin nombre'}`);
                                    
                                        if (!moduleHistory.includes(currentModule.id)) {
                                            moduleHistory.push(currentModule.id);
                                        }
                                    
                                        // **Reiniciar navegación**
                                        this.navigationMode = 'module';
                                        this.corridorPartIndex = 0;
                                        this.currentCorridor = null;
                                    
                                        // **Verificar que updateBackground no cause problemas**
                                        if (!currentModule.background) {
                                            console.warn(`Advertencia: El módulo ${currentModule.id} no tiene fondo definido.`);
                                        }
                                    
                                        updateBackground(currentModule);
                                        startDialogue(currentModule);
                                    
                                        // **Verificar que startDialogue no esté causando el problema**
                                        console.log(`Diálogo iniciado en módulo ${currentModule.id}`);
                                    
                                        drawMap();
                                    
                                        // **Asegurar que el menú principal de la mazmorra reaparece**
                                        setTimeout(() => {
                                            showDungeonMainMenu();
                                        }, 100);
                                    }
                                }

                            } else if (selection.type === 'module') {
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

                        // En modo módulo, en el menú se muestra sólo la información del módulo actual
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

                } else if (this.currentDialogues) {

                    hideDialogueContainer()

                    this.currentDialogues = null
                    this.currentDialogueIndex = 0
                    showDungeonMainMenu()
                }
            }
        })


        
        createHUD(this)
    }
}
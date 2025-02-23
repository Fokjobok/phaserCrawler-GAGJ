import CONFIG from "./config.js"

export function showMenu(options, onSelect) {
    const menuContainer = document.createElement('div')
    menuContainer.id = 'menuContainer'

    options.forEach(option => {
        const btn = document.createElement('button')
        btn.textContent = option

        btn.onclick = () => {
            document.body.removeChild(menuContainer)

            onSelect(option)
        }


        menuContainer.appendChild(btn)
    })


    document.body.appendChild(menuContainer)
}

export function showShopMenu(scene) {
    showMenu(['🛒 Comprar', '💰 Vender', '🗣️ Hablar', '🚪 Salir'], selection => {
        console.log(`Opción de tienda seleccionada: ${selection}`)

        if (selection === '🚪 Salir') {
            showScenarioMenu(scene)

        } else {
            alert(`Funcionalidad "${selection}" no implementada aún.`)
            showShopMenu(scene)

        }
    })
}

export function showScenarioMenu(scene) {
    showMenu(['🗣️ Hablar', '🔍 Explorar', '🛤️ Viajar', '🎒 Inventario', '📊 Estado'], selection => {
        console.log(`Opción de escenario seleccionada: ${selection}`)
        switch (selection) {

            case '🗣️ Hablar':
                showNPCSubMenu(scene)
                break

            case '🔍 Explorar':
                alert(`Funcionalidad "${selection}" no implementada aún.`)
                showScenarioMenu(scene)
                break

            case '🛤️ Viajar':
                showTravelMenu(scene)
                break

            case '🎒 Inventario':
                alert(`Funcionalidad "${selection}" no implementada aún.`)
                showScenarioMenu(scene)
                break

            case '📊 Estado':
                alert(`Funcionalidad "${selection}" no implementada aún.`)
                showScenarioMenu(scene)
                break

            default:
                showScenarioMenu(scene)
                break
        }
    })
}

export function showNPCSubMenu(scene) {
    const container = document.createElement('div')
    container.id = 'npcTalkMenuContainer'

    scene.npcs.forEach(npc => {
        const row = document.createElement('div')
        row.className = 'npcRow'

        const affinity = (npc.affinity !== undefined) ? npc.affinity : '?'
        const textSpan = document.createElement('span')
        textSpan.textContent = `${npc.name} - ${npc.role} - Afinidad: ${affinity}`

        row.appendChild(textSpan)

        const btnContainer = document.createElement('div')
        btnContainer.className = 'npcBtnContainer'

        const talkBtn = document.createElement('button')
        talkBtn.textContent = '🗣️'

        talkBtn.onclick = () => {
            document.body.removeChild(container)
            scene.startNPCDialog(npc)

        }


        btnContainer.appendChild(talkBtn)

        if (npc.shop) {
            const buyBtn = document.createElement('button')
            buyBtn.textContent = '🛒'

            buyBtn.onclick = () => {
                document.body.removeChild(container)


                showStoreMenu(scene, npc)
            }

            btnContainer.appendChild(buyBtn)

            
            const sellBtn = document.createElement('button')
            sellBtn.textContent = '💰'

            sellBtn.onclick = () => {
                alert(`Vender no implementada aún`)

            }

            btnContainer.appendChild(sellBtn)

        } else {
            const buyBtn = document.createElement('button')
            buyBtn.textContent = '🛒'
            buyBtn.disabled = true
            buyBtn.title = 'No disponible'

            btnContainer.appendChild(buyBtn)


            const sellBtn = document.createElement('button')
            sellBtn.textContent = '💰'
            sellBtn.disabled = true
            sellBtn.title = 'No disponible'

            btnContainer.appendChild(sellBtn)
        }


        row.appendChild(btnContainer)
        container.appendChild(row)
    })

    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backBtn'

    backBtn.onclick = () => {
        container.remove()


        showScenarioMenu(scene)
    }


    container.appendChild(backBtn)
    document.body.appendChild(container)
}



export function showPostDialogueMenu(scene) {
    const lastDialog = scene.dialogs ? scene.dialogs[scene.currentIndex - 1] : null

    return (lastDialog && lastDialog.shop) ? showShopMenu(scene) : showScenarioMenu(scene)
}



export function showStoreMenu(scene, npc) {
    const container = document.createElement('div')
    container.id = 'storeMenuContainer'

    const playerAffinity = scene.playerAffinity || 4
    const storeItems = npc.store || []
    const availableItems = storeItems.filter(item => item.affinity <= playerAffinity)

    if (availableItems.length === 0) {
        const msg = document.createElement('p')
        msg.textContent = "No hay artículos a la venta disponibles para tu afinidad"

        container.appendChild(msg)

    } else {
        availableItems.forEach(storeItem => {
            const itemData = getItemData(storeItem.cat, storeItem.id)
            const itemName = storeItem.name || (itemData ? itemData.name : 'Item desconocido')
            const buyPrice = itemData && itemData.price ? itemData.price.buy : '?'
            const icon = itemData && itemData.icon ? itemData.icon : ''
            const row = document.createElement('div')
            row.className = 'storeRow'
            const infoSpan = document.createElement('span')
            infoSpan.textContent = `${icon} ${itemName} ${buyPrice}s`

            row.appendChild(infoSpan)


            const buyBtn = document.createElement('button')
            buyBtn.textContent = 'Comprar'

            buyBtn.onclick = () => {
                alert(`Has comprado ${itemName} por ${buyPrice}`)

            }


            row.appendChild(buyBtn)
            container.appendChild(row)
        })
    }

    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backBtn'

    backBtn.onclick = () => {

        container.remove()


        showNPCSubMenu(scene)
    }


    container.appendChild(backBtn)
    document.body.appendChild(container)
}



export function showTravelMenu(scene) {
    const existing = document.getElementById('travelMenuContainer')
    if (existing) existing.remove()
  
    const container = document.createElement('div')
    container.id = 'travelMenuContainer'
  
    function getBackgroundURL(background) {
        if (background.endsWith('.webp') || background.endsWith('.png'))
            return `assets/backgrounds/${background}`


        const webpBackgrounds = ['dungate', 'nforest']
            return webpBackgrounds.includes(background)
                ? `assets/backgrounds/${background}.webp`
                : `assets/backgrounds/${background}.png`

    }
  
    const scenarioKeys = Object.keys(scene.scenarioData).filter(key => key !== scene.currentScenarioKey)

    scenarioKeys.forEach(key => {
        const scenario = scene.scenarioData[key]
        const row = document.createElement('div')
        row.classList.add('travelRow')

        if (scenario.background)
        row.style.backgroundImage = `url(${getBackgroundURL(scenario.background)})`

        const nameSpan = document.createElement('span')
        nameSpan.textContent = scenario.name
        row.appendChild(nameSpan)

        const visitBtn = document.createElement('button')
        visitBtn.textContent = 'Visitar'

        visitBtn.onclick = () => {
            container.remove()
            scene.currentScenarioKey = key
            import('../scenes/VnScene.js')

                .then(module => {
                    if (typeof module.visitScenario === 'function')
                        module.visitScenario(scene, key)

                    else
                        console.error('visitScenario no es una función')

                })


                .catch(error => console.error('Error al importar VnScene:', error))
        }


        row.appendChild(visitBtn)
        container.appendChild(row)
    })
  

    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backBtn'

    backBtn.onclick = () => {
        container.remove()


        showScenarioMenu(scene)
    }


    container.appendChild(backBtn)
    document.body.appendChild(container)
}



export function showMovementMenu(currentNode, modulePositions, onSelect) {
    const existing = document.getElementById('movementMenuContainer')

    if (existing) existing.remove()

    const container = document.createElement('div')
    container.id = 'movementMenuContainer'

    const mapContainer = document.createElement('div')
    mapContainer.id = 'movementMap'

    if (currentNode.type === 'corridor') {
        const node = document.createElement('div')
        node.className = 'nodeBox currentNode'
        node.textContent = "Pasillo"

        mapContainer.appendChild(node)

    } else {
        const node = document.createElement('div')
        node.className = 'nodeBox currentNode'
        node.textContent = "Módulo " + currentNode.module.id

        mapContainer.appendChild(node)
    }

    container.appendChild(mapContainer)


    let options = []
    if (currentNode.type === 'corridor') {
        if (currentNode.partIndex > 0) {
            options.push({ text: "Anterior", option: { type: 'corridor', move: 'prev' } })

        } else {
            options.push({ text: "Anterior", option: { type: 'module', module: currentNode.fromModule } })

        }
        if (currentNode.partIndex < currentNode.corridor.parts.length - 1) {
            options.push({ text: "Siguiente", option: { type: 'corridor', move: 'next' } })

        } else {
            options.push({ text: "Siguiente", option: { type: 'module', module: currentNode.toModule } })

        }

    } else {
        if (currentNode.prev) {
            options.push({ text: "Anterior", option: currentNode.prev })

        }
        if (currentNode.next) {
            options.push({ text: "Siguiente", option: currentNode.next })

        }
    }

    options.forEach(item => {
        const row = document.createElement('div')
        row.classList.add('travelRow')

        const span = document.createElement('span')
        span.textContent = item.text

        row.appendChild(span)


        const btn = document.createElement('button')
        btn.textContent = 'Seleccionar'

        btn.onclick = () => {
            container.remove()


            onSelect(item.option)
        }


        row.appendChild(btn)
        container.appendChild(row)
    })

    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backBtn'

    backBtn.onclick = () => {
        container.remove()


        onSelect("volver")
    }


    container.appendChild(backBtn)
    document.body.appendChild(container)
}



function getItemData(cat, id) {
    if (window.itemDB && window.itemDB[cat]) {
        let data = window.itemDB[cat]

        if (data.hasOwnProperty(cat)) {
            data = data[cat]

        }


        return data[id] || null
    }

    
    return null
}
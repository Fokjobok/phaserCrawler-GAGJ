import CONFIG from "./config.js"

function rgbToHex(rgbArray) {
    return '#' + rgbArray.map(component => {
        let hex = component.toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }).join('')
}

function rgbToRGBA(rgbArray, alpha = 0.5) {
    return `rgba(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]}, ${alpha})`
}

function formatStat(value) {
    return value < 10 ? "\u00A0" + value : value
}

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
    showMenu(['🗣️ Hablar', '🔍 Explorar', '🛤️ Viajar', '🎒 Inventario', '📊 Estado', '❓ Misiones'], selection => {
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
                showInventoryMenu(scene, scene.player)
                break

            case '📊 Estado':
                showStatusCards(scene)
                break

            case '❓ Misiones':
                showQuestLog(scene, scene.player)
                break

            default:
                showScenarioMenu(scene)
                break
        }
    })
}

export function showInventoryMenu(scene, player) {
    const container = document.createElement('div')
    container.id = 'inventoryMenuContainer'

    // Crear contenedor de cabecera (fijo) para las pestañas
    const header = document.createElement('div')
    header.id = 'inventoryHeader'

    // Crear barra de pestañas
    const tabBar = document.createElement('div')
    tabBar.id = 'inventoryTabBar'

    const tabs = [
        { label: '', category: 'all', icon: '📦' },
        { label: '', category: 'consumable', icon: '🍎' },
        { label: '', category: 'usable', icon: '⛏️' },
        { label: '', category: 'equipment', icon: '🛡️' },
        { label: '', category: 'misc', icon: '🔧' }
    ]

    tabs.forEach(tab => {
        const btn = document.createElement('button')
        btn.textContent = `${tab.icon} ${tab.label}`
        btn.onclick = () => {
            Array.from(tabBar.children).forEach(child => child.classList.remove('selected'))
            btn.classList.add('selected')
            updateContent(tab.category)
        }
        tabBar.appendChild(btn)
    })

    header.appendChild(tabBar)
    container.appendChild(header)

    // Área de contenido (scrollable) para mostrar los objetos
    const contentArea = document.createElement('div')
    contentArea.id = 'inventoryContent'
    container.appendChild(contentArea)

    function updateContent(selectedCategory) {
        contentArea.innerHTML = ''

        let filteredItems = []
        if (selectedCategory === 'all') {
            filteredItems = player.inventory
        } else if (selectedCategory === 'consumable') {
            filteredItems = player.inventory.filter(item => item.category === 'consumable')
        } else if (selectedCategory === 'usable') {
            filteredItems = player.inventory.filter(item => item.category === 'usable')
        } else if (selectedCategory === 'equipment') {
            filteredItems = player.inventory.filter(item => ['weapon', 'shield', 'armor', 'accessory', 'shoes'].includes(item.category))
        } else if (selectedCategory === 'misc') {
            filteredItems = player.inventory.filter(item => item.category === 'misc')
        }

        if (filteredItems.length === 0) {
            const msg = document.createElement('p')
            msg.textContent = ""
            contentArea.appendChild(msg)
        } else {
                // Agrupar los items que no sean de tipo "armor"
                let stackable = {}
                let nonStackable = []

                filteredItems.forEach(item => {
                    // Si el item es de tipo "equipment" no se agrupa, sino, se agrupa
                    if (item.category !== 'armor') {
                        let key = item.id || item.name
                        if (stackable[key]) {
                            stackable[key].quantity += item.quantity || 1
                        }
                        else {
                            // Clonar el item y forzar la cantidad
                            stackable[key] = { ...item }
                            stackable[key].quantity = item.quantity || 1
                        }
                    }
                    else {
                        nonStackable.push(item)
                    }
            })

            // Renderizar los items agrupados
            for (let key in stackable) {
                const aggItem = stackable[key]
                const btn = document.createElement('button')
                btn.className = 'inventoryRow'
                btn.textContent = `${aggItem.icon} ${aggItem.name} x${aggItem.quantity}`
                btn.title = `Cantidad: ${aggItem.quantity}\n${aggItem.desc || 'Sin descripción.'}`
                contentArea.appendChild(btn)
            }
            // Renderizar los items no agrupados (por ejemplo, armor)
            nonStackable.forEach(item => {
                const btn = document.createElement('button')
                btn.className = 'inventoryRow'
                const quantity = item.quantity || 1
                btn.textContent = `${item.icon} ${item.name}`
                btn.title = `Cantidad: ${quantity}\n${item.desc || 'Sin descripción.'}`
                contentArea.appendChild(btn)
            })


        }
    }

    updateContent('all')

    // Crear contenedor de pie (fijo) para el botón "Volver"
    const footer = document.createElement('div')
    footer.id = 'inventoryFooter'
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.onclick = () => {
        container.remove()
        showScenarioMenu(scene)
    }
    footer.appendChild(backBtn)
    container.appendChild(footer)

    document.body.appendChild(container)


}




function getQuestIcon(npc, player) {
    // Prioridad máxima: el jugador tiene una misión completada (hay que cobrarla)
    if (player && player.mission && player.mission.completed) {
        return "❓"
    }
    // Si el NPC tiene asignada una misión y es diferente a la que tiene el jugador (o el jugador no tiene ninguna),
    // entonces se muestra la misión del NPC según su tipo
    if (npc && npc.mission) {
        if (!player.mission || (player.mission && player.mission.id !== npc.mission.id)) {
            if (npc.mission.type === 'main') {
                return "❗️"
            }
            if (npc.mission.type === 'secondary') {
                return "❕"
            }
        }
    }
    // Si el jugador tiene una misión pendiente sin completar
    if (player && player.mission && !player.mission.completed) {
        return "❔"
    }
    return ""
}

function showQuestDialogue(npc, scene) {
    const quest = npc.mission
    // Prepara el texto de la misión con título y detalles
    const questText = `${npc.name} te está ofreciendo la misión:\n"${quest.title}"\n\nDetalles:\n${quest.steps.join("\n")}\n\nPresiona Z para leer y luego se te preguntará: ¿Aceptas la misión?`
    
    // Crea un objeto diálogo para la misión
    const questDialog = {
        text: [questText],
        speakerName: npc.name,
        image: `assets/npcs/${npc.image_path}.webp`
    }
    // Guarda la conversación original para restaurarla después
    const originalDialogs = scene.dialogs
    scene.dialogs = [questDialog]
    scene.currentIndex = 0
    // Llama a showDialog para mostrar el texto letra a letra
    showDialog(scene)
    
    // Después de un delay (ajusta el tiempo según la longitud del texto)
    setTimeout(() => {
        // Crea un modal para elegir "Aceptar" o "Rechazar"
        const container = document.createElement('div')
        container.id = 'questChoiceContainer'
        container.style.position = 'fixed'
        container.style.top = '50%'
        container.style.left = '50%'
        container.style.transform = 'translate(-50%, -50%)'
        container.style.backgroundColor = '#333'
        container.style.color = '#fff'
        container.style.padding = '20px'
        container.style.border = '2px solid #fff'
        container.style.zIndex = 1001

        const choiceText = document.createElement('p')
        choiceText.innerText = "¿Aceptas la misión?"
        container.appendChild(choiceText)
        
        const acceptBtn = document.createElement('button')
        acceptBtn.textContent = 'Aceptar'
        acceptBtn.style.marginRight = '10px'
        acceptBtn.onclick = () => {
            // Asigna la misión al jugador (se hace una copia simple)
            scene.player.mission = Object.assign({}, quest)
            console.log(`Misión "${quest.title}" aceptada por el jugador`)
            document.body.removeChild(container)
            // Restaura los diálogos originales y continúa la interacción
            scene.dialogs = originalDialogs
            scene.startNPCDialog(npc)
        }
        container.appendChild(acceptBtn)
        
        const rejectBtn = document.createElement('button')
        rejectBtn.textContent = 'Rechazar'
        rejectBtn.onclick = () => {
            console.log(`Misión "${quest.title}" rechazada por el jugador`)
            document.body.removeChild(container)
            // Restaura los diálogos originales y continúa la interacción
            scene.dialogs = originalDialogs
            scene.startNPCDialog(npc)
        }
        container.appendChild(rejectBtn)
        
        document.body.appendChild(container)
    }, 6000) // Delay en milisegundos; ajustar según sea necesario
}

export function showNPCSubMenu(scene, player) {
    const container = document.createElement('div')
    container.id = 'npcTalkMenuContainer'

    const headerNpcText = document.createElement('div')
    headerNpcText.className = 'headerNpcText'
    headerNpcText.textContent = 'Selecciona a alguien para interactuar:'
    container.appendChild(headerNpcText)


    scene.npcs.forEach(npc => {
        const row = document.createElement('div')
        row.className = 'npcRow'
        const affinity = (npc.affinity !== undefined) ? npc.affinity : '0'
    
        const npcDesc = document.createElement('div')
        npcDesc.className = 'npcDesc'
        npcDesc.style.display = 'flex'
        npcDesc.style.justifyContent = 'space-between'
        npcDesc.style.width = '100%'
    
        const leftSpan = document.createElement('span')
        leftSpan.innerHTML = `<strong>${npc.name}</strong> - ${npc.role}`
    
        const rightSpan = document.createElement('span')
        rightSpan.textContent = `💞: ${affinity}`
        npcDesc.appendChild(leftSpan)
        npcDesc.appendChild(rightSpan)
        row.appendChild(npcDesc)
    
        const btnContainer = document.createElement('div')
        btnContainer.className = 'npcBtnContainer'
    
        // Botón de hablar: se asigna el icono solo una vez al crear el menú.
        const talkBtn = document.createElement('button')
        const questIcon = getQuestIcon(npc, scene.player)
        talkBtn.textContent = questIcon ? questIcon : "🗣️"
        talkBtn.onclick = () => {
            document.body.removeChild(container)
            scene.startNPCDialog(npc)
        }
        btnContainer.appendChild(talkBtn)
    
        // Botones de tienda o venta se mantienen igual...
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
                document.body.removeChild(container)
                showSellMenu(scene, scene.player)
            }
            btnContainer.appendChild(sellBtn)
        }
        else {
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

    const header = document.createElement('div')
    header.textContent = 'Comprar un artículo:'
    header.className = 'headerTitle'
    container.appendChild(header)

    const playerAffinity = scene.playerAffinity || 4
    const storeItems = npc.store || []
    const availableItems = storeItems.filter(item => item.affinity <= playerAffinity)

    // Objeto para almacenar la cantidad seleccionada por cada artículo (clave única por artículo)
    const purchaseQuantities = {}

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
            
            // Usaremos una clave única (podría ser storeItem.id o concatenar cat+id)
            const itemKey = storeItem.id || (storeItem.cat + '_' + storeItem.name)
            // Inicialmente, la cantidad es 0
            purchaseQuantities[itemKey] = 0

            const row = document.createElement('div')
            row.className = 'storeRow'
            
            const itemRow = document.createElement('div')
            itemRow.className = 'itemRow'
            const infoSpan = document.createElement('span')
            infoSpan.textContent = `${icon} ${itemName} ${buyPrice}s`
            itemRow.appendChild(infoSpan)
            row.appendChild(itemRow)
            
            // Crear el control de cantidad: botón "-", campo de cantidad y botón "+"
            const quantityControl = document.createElement('div')
            quantityControl.className = 'quantityControl'
            
            const minusBtn = document.createElement('button')
            minusBtn.textContent = '-'
            minusBtn.classList.add('minus-btn')
            purchaseQuantities[itemKey] = purchaseQuantities[itemKey] || 0

            minusBtn.onclick = () => {
                // Convertir a número (por si acaso)
                let currentQuantity = Number(purchaseQuantities[itemKey]) || 0
                if (currentQuantity > 0) {
                    currentQuantity--
                    purchaseQuantities[itemKey] = currentQuantity
                    quantityDisplay.textContent = currentQuantity
                    updateTotalCost()
                }
            }
            
            const quantityDisplay = document.createElement('span')
            quantityDisplay.textContent = purchaseQuantities[itemKey]
            quantityDisplay.className = 'quantityDisplay'
            
            const plusBtn = document.createElement('button')
            plusBtn.textContent = '+'
            plusBtn.classList.add('plus-btn')
            plusBtn.onclick = () => {
                // Comprobamos explícitamente si storeItem.quantity es un número
                if (typeof storeItem.quantity === 'number' ? purchaseQuantities[itemKey] < storeItem.quantity : true) {
                    purchaseQuantities[itemKey]++
                    quantityDisplay.textContent = purchaseQuantities[itemKey]
                    updateTotalCost()
                }
                else {
                    alert("Has alcanzado el límite de compra para este artículo.")
                }
            }
            
            quantityControl.appendChild(minusBtn)
            quantityControl.appendChild(quantityDisplay)
            quantityControl.appendChild(plusBtn)
            
            row.appendChild(quantityControl)
            container.appendChild(row)
        })
    }

    // Línea de resumen: Oro total - Oro a pagar = Oro restante
    const summaryRow = document.createElement('div')
    summaryRow.className = 'storeSummary'
    const summaryText = document.createElement('p')
    summaryRow.appendChild(summaryText)
    container.appendChild(summaryRow)

    // Botón final de compra para adquirir todos los artículos al mismo tiempo
    const storeBtn = document.createElement('div')
    storeBtn.className = 'storeButtons'

    const buyBtn = document.createElement('button')
    buyBtn.textContent = '🛒 Comprar'
    buyBtn.className = 'buyBtn'
    buyBtn.onclick = () => {
        const totalCost = calculateTotalCost()
        if (scene.player.gold >= totalCost) {
            // Añadir los artículos al inventario según la cantidad seleccionada
            availableItems.forEach(storeItem => {
                const itemData = getItemData(storeItem.cat, storeItem.id)
                const itemKey = storeItem.id || (storeItem.cat + '_' + storeItem.name)
                const quantity = purchaseQuantities[itemKey] || 0

                for (let i = 0; i < quantity; i++) {
                    scene.player.addToInventory(itemData)
                }

                if (typeof storeItem.quantity === 'number') {
                    storeItem.quantity -= quantity
                    if (storeItem.quantity < 0) {
                        storeItem.quantity = 0
                    }
                }
                purchaseQuantities[itemKey] = 0
            })
            scene.player.gold -= totalCost
            alert(`Has comprado los artículos por un total de ${totalCost}`)
            updateTotalCost() // Actualizar el resumen

            container.querySelectorAll('.quantityDisplay').forEach(display => {
                display.textContent = '0'
            })
        } else {
            alert('No tienes suficiente dinero')
        }
    }


    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = '🔙 backBtn'
    backBtn.onclick = () => {
        container.remove()
        showNPCSubMenu(scene)
    }
    storeBtn.appendChild(buyBtn)
    storeBtn.appendChild(backBtn)
    container.appendChild(storeBtn)
    document.body.appendChild(container)

    function calculateTotalCost() {
        let total = 0
        availableItems.forEach(storeItem => {
            const itemData = getItemData(storeItem.cat, storeItem.id)
            const price = itemData && itemData.price && itemData.price.buy ? Number(itemData.price.buy) : 0
            const itemKey = storeItem.id || (storeItem.cat + '_' + storeItem.name)
            total += price * purchaseQuantities[itemKey]
        })
        return total
    }

    function updateTotalCost() {
        const totalCost = calculateTotalCost()
        const goldTotal = scene.player.gold
        const remaining = goldTotal - totalCost
        summaryText.textContent = `Dinero: ${goldTotal} - Costes: ${totalCost} = Restante: ${remaining}`
        // Si el oro a pagar sobrepasa el oro total, cambiar color a rojo
        summaryText.style.color = totalCost > goldTotal ? 'red' : 'white'
        summaryText.style.fontSize = '24px'
        summaryText.style.fontWeight = 'bold'
    }

    // Inicializar el resumen
    updateTotalCost()
}




export function showSellMenu(scene, player) {
    const container = document.createElement('div')
    container.id = 'storeMenuContainer'

    const header = document.createElement('div')
    header.textContent = 'Vender un artículo:'
    header.className = 'headerTitle'
    
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backBtn'
    backBtn.onclick = () => {
        container.remove()
        showNPCSubMenu(scene)
    }

    // Función para agrupar y renderizar el inventario y controles de venta
    function updateContent() {
        container.innerHTML = ''
        container.appendChild(header)

        // Agrupar objetos por id (o nombre si no existe id)
        const stackable = {}
        player.inventory.forEach(item => {
            const key = item.id || item.name
            const qty = item.quantity || 1
            if (stackable[key]) {
                stackable[key].quantity += qty
            } else {
                stackable[key] = Object.assign({}, item)
                stackable[key].quantity = qty
            }
        })

        const stackableItems = Object.values(stackable)
        // Objeto para almacenar la cantidad a vender por cada artículo
        const sellQuantities = {}
        stackableItems.forEach(group => {
            const key = group.id || group.name
            sellQuantities[key] = 0
        })

        if (stackableItems.length === 0) {
            const msg = document.createElement('p')
            msg.textContent = "Tu inventario está vacío."
            msg.style.color = 'white';
            container.appendChild(msg)
        } else {
            stackableItems.forEach(group => {
                const sellPrice = (group.price && group.price.sell) ? group.price.sell : 0
                const row = document.createElement('div')
                row.className = 'storeRow'
                const itemRow = document.createElement('div')
                itemRow.className = 'itemRow'
                const infoSpan = document.createElement('span')
                infoSpan.textContent = `${group.icon} ${group.name} (x${group.quantity}) - ${sellPrice}s/u`
                infoSpan.title = group.desc || 'Sin descripción.'
                itemRow.appendChild(infoSpan)
                row.appendChild(itemRow)

                // Crear el control de cantidad: botón "-", campo de cantidad y botón "+"
                const quantityControl = document.createElement('div')
                quantityControl.className = 'quantityControl'

                const minusBtn = document.createElement('button')
                minusBtn.textContent = '-'
                minusBtn.classList.add('minus-btn')
                const quantityDisplay = document.createElement('span')
                const key = group.id || group.name
                quantityDisplay.textContent = sellQuantities[key]
                quantityDisplay.className = 'quantityDisplay'
                const plusBtn = document.createElement('button')
                plusBtn.textContent = '+'
                plusBtn.classList.add('plus-btn')

                minusBtn.onclick = () => {
                    if (sellQuantities[key] > 0) {
                        sellQuantities[key]--
                        quantityDisplay.textContent = sellQuantities[key]
                        updateTotalRevenue()
                    }
                }
                plusBtn.onclick = () => {
                    // No se puede vender más que lo que se tiene
                    if (sellQuantities[key] < group.quantity) {
                        sellQuantities[key]++
                        quantityDisplay.textContent = sellQuantities[key]
                        updateTotalRevenue()
                    }
                }

                quantityControl.appendChild(minusBtn)
                quantityControl.appendChild(quantityDisplay)
                quantityControl.appendChild(plusBtn)
                row.appendChild(quantityControl)
                container.appendChild(row)
            })
        }

        // Línea de resumen: Dinero + Ganancia = Total
        const summaryRow = document.createElement('div')
        summaryRow.className = 'storeSummary'
        const summaryText = document.createElement('p')
        summaryRow.appendChild(summaryText)
        container.appendChild(summaryRow)

        // Botón final de venta para vender todos los artículos seleccionados
        const storeBtn = document.createElement('div')
        storeBtn.className = 'storeButtons'
        const sellBtn = document.createElement('button')
        sellBtn.className = 'sellBtn'
        sellBtn.textContent = '💰 Vender'
        sellBtn.onclick = () => {
            const totalRevenue = calculateTotalRevenue()
            // Recorrer cada clave en sellQuantities y eliminar del inventario
            for (const key in sellQuantities) {
                let quantityToSell = sellQuantities[key]
                while (quantityToSell > 0) {
                    const index = player.inventory.findIndex(item => (item.id || item.name) === key)
                    if (index === -1) break
                    if (player.inventory[index].quantity && player.inventory[index].quantity > quantityToSell) {
                        player.inventory[index].quantity -= quantityToSell
                        quantityToSell = 0
                    } else {
                        quantityToSell -= (player.inventory[index].quantity || 1)
                        player.inventory.splice(index, 1)
                    }
                }
            }
            player.gold += totalRevenue
            alert(`Has vendido los artículos por un total de ${totalRevenue}`)
            // Re-renderizar el contenido para ver los cambios
            updateContent()
            updateTotalRevenue()
        }
        if (stackableItems.length > 0) {
            storeBtn.appendChild(sellBtn)
        }
        storeBtn.appendChild(backBtn)
        container.appendChild(storeBtn)

        document.body.appendChild(container)


        function calculateTotalRevenue() {
            let total = 0
            stackableItems.forEach(group => {
                const sellPrice = (group.price && group.price.sell) ? group.price.sell : 0
                const key = group.id || group.name
                total += sellPrice * sellQuantities[key]
            })
            return total
        }

        function updateTotalRevenue() {
            const totalRevenue = calculateTotalRevenue()
            const goldTotal = player.gold
            const totalAfterSale = goldTotal + totalRevenue
            if (stackableItems.length === 0) {
                summaryText.textContent = ""
            } else {
                summaryText.textContent = `Dinero: ${goldTotal} + Ganancias: ${totalRevenue} = Total: ${totalAfterSale}`
                summaryText.style.color = totalRevenue > 0 ? 'lightgreen' : 'white'
                summaryText.style.fontSize = '24px'
                summaryText.style.fontWeight = 'bold'
            }
        }

        updateTotalRevenue()
    }

    updateContent()
}


export function showTravelMenu(scene) {
    const existing = document.getElementById('travelMenuContainer')
    if (existing) existing.remove()

    const container = document.createElement('div')
    container.id = 'travelMenuContainer'

    function getBackgroundURL(background) {
        if (background.endsWith('.webp') || background.endsWith('.png')) {
            if (background.includes("module_"))
                return `assets/backgrounds/modules/${background}`
            if (background.includes("corridor_"))
                return `assets/backgrounds/corridors/${background}`
            return `assets/backgrounds/${background}`
        }
        const webpBackgrounds = ['dungate', 'nforest']
        return webpBackgrounds.includes(background)
            ? `assets/backgrounds/${background}.webp`
            : `assets/backgrounds/${background}.png`
    }

    // Obtenemos el escenario actual y su lista de warps
    const currentScenario = scene.scenarioData[scene.currentScenarioKey]
    const availableWarps = currentScenario.warps || []

    availableWarps.forEach(key => {
        const scenario = scene.scenarioData[key]
        if (!scenario) {
            console.error(`El escenario "${key}" no existe en scenarioData`)
            return
        }
        const row = document.createElement('div')
        row.classList.add('travelRow')
        row.style.cursor = "pointer"
        if (scenario.background) {
            row.style.backgroundImage = `url(${getBackgroundURL(scenario.background)})`
        }
        const nameSpan = document.createElement('span')
        nameSpan.textContent = scenario.name
        row.appendChild(nameSpan)
        row.onclick = () => {
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

    // Función auxiliar para obtener la URL del fondo (igual que en showTravelMenu)
    function getBackgroundURL(background) {
        if (background.endsWith('.webp') || background.endsWith('.png')) {
            if (background.includes("module_"))
                return `assets/backgrounds/modules/${background}`
            if (background.includes("corridor_"))
                return `assets/backgrounds/corridors/${background}`
            return `assets/backgrounds/${background}`
        }
        const webpBackgrounds = ['dungate', 'nforest']
        return webpBackgrounds.includes(background)
            ? `assets/backgrounds/${background}.webp`
            : `assets/backgrounds/${background}.png`
    }

    const container = document.createElement('div')
    container.id = 'movementMenuContainer'

    const mapContainer = document.createElement('div')
    mapContainer.id = 'movementMap'

    if (currentNode.type === 'corridor') {
        const node = document.createElement('div')
        node.className = 'nodeBox currentNode'
        node.textContent = "Pasillo"
        mapContainer.appendChild(node)
    }
    else {
        const node = document.createElement('div')
        node.className = 'nodeBox currentNode'
        node.textContent = "Módulo " + currentNode.module.id
        mapContainer.appendChild(node)
    }
    container.appendChild(mapContainer)

    let options = []
    if (currentNode.type === 'corridor') {
        // Ahora consideramos que currentNode.partIndex es 1-indexado
        if (currentNode.partIndex > 1) {
            options.push({ 
                text: "Anterior", 
                option: { type: 'corridor', move: 'prev', partIndex: currentNode.partIndex +1 } 
            })
        } else {
            // En el primer pasillo se retorna el módulo de origen
            options.push({ text: "Anterior", option: { type: 'module', ...currentNode.fromModule } })
        }
        if (currentNode.partIndex < currentNode.corridor.parts.length) {
            options.push({ 
                text: "Siguiente", 
                option: { type: 'corridor', move: 'next', partIndex: currentNode.partIndex + 1 } 
            })
        } else {
            options.push({ 
                text: "Siguiente", 
                option: { type: 'corridor', move: 'exit', partIndex: currentNode.partIndex, fromModule: currentNode.fromModule, toModule: currentNode.toModule } 
            })
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
        let bgUrl = ""
        if (item.option.fromModule && item.option.toModule) {
            if (item.text === "Anterior") {
                bgUrl = getBackgroundURL(item.option.fromModule.image)
            } else if (item.text === "Siguiente") {
                bgUrl = getBackgroundURL(item.option.toModule.image)
            }
        } else if (item.option.type === 'corridor' && currentNode.corridor) {
            // Se resta 1 para ajustar el índice al arreglo (0-indexado)
            const targetIndex = (item.option.partIndex !== undefined) ? item.option.partIndex - 1 : currentNode.partIndex - 1
            bgUrl = getBackgroundURL(currentNode.corridor.images[targetIndex])
        } else if (item.option.type === 'module' && item.option.image) {
            bgUrl = getBackgroundURL(item.option.image)
        }
        if (bgUrl) {
            row.style.backgroundImage = `url(${bgUrl})`
        }
        
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

export function showStatusCards(scene) {
    // Usa groupMembers si existen; de lo contrario, usa scene.player
    const players = (scene.groupMembers && scene.groupMembers.length > 0)
        ? scene.groupMembers.filter(p => p !== undefined)
        : (scene.player ? [scene.player] : [])
    if (!players || players.length === 0) {
        console.error("No hay datos de jugadores disponibles")
        return
    }

    let currentIndex = 0

    // Crear overlay y contenedor usando los IDs definidos en el CSS
    const overlay = document.createElement("div")
    overlay.id = "statusOverlay"

    const container = document.createElement("div")
    container.id = "statusCardContainer"

    // Botón de cerrar para volver al menú principal
    const closeBtn = document.createElement("button")
    closeBtn.className = "close-btn"
    closeBtn.textContent = "X"
    closeBtn.onclick = () => {
        overlay.remove()
        showScenarioMenu(scene)
        console.log("Volviendo al menú de escenario")

    }
    container.appendChild(closeBtn)

    // Botón flecha izquierda
    const leftArrow = document.createElement("button")
    leftArrow.className = "arrow"
    leftArrow.textContent = "⇚"
    leftArrow.onclick = () => {
        currentIndex = (currentIndex - 1 + players.length) % players.length
        renderCard()
    }

    // Botón flecha derecha
    const rightArrow = document.createElement("button")
    rightArrow.className = "arrow"
    rightArrow.textContent = "⇛"
    rightArrow.onclick = () => {
        currentIndex = (currentIndex + 1) % players.length
        renderCard()
    }

    // Contenedor para el contenido de la tarjeta
    const cardContent = document.createElement("div")
    cardContent.id = "statusCardContent"

    // Agregar flechas y contenido al contenedor principal
    container.appendChild(leftArrow)
    container.appendChild(cardContent)
    container.appendChild(rightArrow)

    overlay.appendChild(container)
    document.body.appendChild(overlay)

    function renderCard() {
        cardContent.innerHTML = ""
        const player = players[currentIndex]
        // Obtener colores usando métodos del Player, con fallback
        let cardColor = (player.getColorAsHex && typeof player.getColorAsHex === 'function')
            ? player.getColorAsHex() : '#CCCCCC'
        let subColor = (player.getColorAsRGBA && typeof player.getColorAsRGBA === 'function')
            ? player.getColorAsRGBA(1) : 'rgba(200,200,200,1)'
        // Derivar la imagen a partir del job del jugador
        let imagePath = `assets/characters/${player.job}.webp`
        // Parte superior: estadísticas fijas
        let statsStr = `
            <div class="status-card-stats-grid">
                <button class="stat" data-stat="str" 
                    onmouseover="this.style.backgroundColor='${cardColor}'" 
                    onmouseout="this.style.backgroundColor=''" 
                    onclick="increaseStat(event)">STR: ${formatStat(player.str)}</button>
                <button class="stat" data-stat="vit" 
                    onmouseover="this.style.backgroundColor='${cardColor}'" 
                    onmouseout="this.style.backgroundColor=''" 
                    onclick="increaseStat(event)">VIT: ${formatStat(player.vit)}</button>
                <button class="stat" data-stat="agi" 
                    onmouseover="this.style.backgroundColor='${cardColor}'" 
                    onmouseout="this.style.backgroundColor=''" 
                    onclick="increaseStat(event)">AGI: ${formatStat(player.agi)}</button>
                <button class="stat" data-stat="dex" 
                    onmouseover="this.style.backgroundColor='${cardColor}'" 
                    onmouseout="this.style.backgroundColor=''" 
                    onclick="increaseStat(event)">DEX: ${formatStat(player.dex)}</button>
                <button class="stat" data-stat="wis" 
                    onmouseover="this.style.backgroundColor='${cardColor}'" 
                    onmouseout="this.style.backgroundColor=''" 
                    onclick="increaseStat(event)">WIS: ${formatStat(player.wis)}</button>
                <button class="stat" data-stat="sou" 
                    onmouseover="this.style.backgroundColor='${cardColor}'" 
                    onmouseout="this.style.backgroundColor=''" 
                    onclick="increaseStat(event)">SOU: ${formatStat(player.sou)}</button>
            </div>
            `
        // Parte inferior: datos dinámicos y equipamiento
        let parametersHTML = `
            <div class="player-stats">
                <p>Jugador: ${player.name} (${player.job.charAt(0).toUpperCase() + player.job.slice(1)}) - Nivel: ${player.level}</p>
                <p>HP: ${player.hp}/${player.hp_max} &nbsp;&nbsp;&nbsp; SP: ${player.sp}/${player.sp_max}</p>
                <p>ATK: ${player.total_atk} &nbsp;&nbsp;&nbsp; MATK: ${player.total_matk}</p>
                <p>DEF: ${player.total_def} &nbsp;&nbsp;&nbsp; MDEF: ${player.total_mdef}</p>
            </div>
        `
        let equipmentHTML = `
            <div class="equipment">
                <p><strong>Equipamiento:</strong></p>
                <p>Arma: ${player.weapon && player.weapon.name ? player.weapon.name : 'Ninguno'} &nbsp;&nbsp;
                Atk: ${player.weapon && player.weapon.atk ? player.weapon.atk : '0'} &nbsp;&nbsp;
                Matk: ${player.weapon && player.weapon.matk ? player.weapon.matk : '0'}</p>
                <p>Escudo: ${player.shield && player.shield.name ? player.shield.name : 'Ninguno'} &nbsp;&nbsp;
                Def: ${player.shield && player.shield.def ? player.shield.def : '0'} &nbsp;&nbsp;
                Mdef: ${player.shield && player.shield.mdef ? player.shield.mdef : '0'}</p>
                <p>Armadura: ${player.armor && player.armor.name ? player.armor.name : 'Ninguno'} &nbsp;&nbsp;
                Def: ${player.armor && player.armor.def ? player.armor.def : '0'} &nbsp;&nbsp;
                Mdef: ${player.armor && player.armor.mdef ? player.armor.mdef : '0'}</p>
                <p>Accesorio: ${player.accessory && player.accessory.name ? player.accessory.name : 'Ninguno'} &nbsp;&nbsp;
                Def: ${player.accessory && player.accessory.def ? player.accessory.def : '0'} &nbsp;&nbsp;
                Mdef: ${player.accessory && player.accessory.mdef ? player.accessory.mdef : '0'}</p>
            </div>
        `
        // Se añade un bloque de pestañas en la "secondary-card"
        let cardHTML = `
            <div class="tab-bar">
                <button class="tab" id="tab-info" style="background-color: ${cardColor}; color: ${subColor};">DETALLES</button>
                <button class="tab" id="tab-tutorial" style="background-color: ${subColor}; color: ${cardColor};">TUTORIAL</button>
                <button class="tab" id="tab-status-vit" style="background-color: ${subColor}; color: ${cardColor};">RESISTENCIA</button>
                <button class="tab" id="tab-status-agi" style="background-color: ${subColor}; color: ${cardColor};">VERSATILIDAD</button>
                <button class="tab" id="tab-status-wis" style="background-color: ${subColor}; color: ${cardColor};">MENTALIDAD</button>
            </div>
            <div class="status-window">
                <div class="card" style="border-color: ${cardColor};">
                <div class="card-bg" style="background-image: url('${imagePath}'); border-radius: 6px;"></div>
                <div class="card-overlay" style="background-color: ${subColor};"></div>
                    <div class="card-content-stats">
                        <h2 class="card-job-title" style="color: ${cardColor};">${player.job.charAt(0).toUpperCase() + player.job.slice(1)}</h2>
                        <div class="card-body">
                            <div class="stats-box">${statsStr}</div>
                        </div>
                    </div>
                </div>
                <div class="secondary-card" style="border-color: ${cardColor}; background-color: ${cardColor};">
                    <div class="tab-content" id="tab-content">
                        <div class="info-content">
                            <div class="card-content-desc">
                                <h2 class="card-title" style="color: ${cardColor};"> ${player.name} </h2>
                                <div class="card-body">
                                    <div class="card-parameters">
                                        ${parametersHTML}
                                    </div>
                                    <div class="card-gear">
                                        ${equipmentHTML}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
        cardContent.innerHTML = cardHTML

        // Asignar eventos a las pestañas para cambiar el contenido
        const tabInfo = cardContent.querySelector('#tab-info')
        const tabTutorial = cardContent.querySelector('#tab-tutorial')
        const tabVIT = cardContent.querySelector('#tab-status-vit')
        const tabAGI = cardContent.querySelector('#tab-status-agi')
        const tabWIS = cardContent.querySelector('#tab-status-wis')
        const tabContent = cardContent.querySelector('#tab-content')
        
        function setActiveTab(activeTabId) {
            const tabs = cardContent.querySelectorAll('.tab')
            tabs.forEach(tab => {
                if (tab.id === activeTabId) {
                    tab.style.backgroundColor = cardColor
                    tab.style.color = subColor
                } else {
                    tab.style.backgroundColor = subColor
                    tab.style.color = cardColor
                }
            })
        }
        
        if (tabInfo && tabTutorial && tabVIT && tabAGI && tabWIS && tabContent) {
            tabInfo.onclick = () => {
                setActiveTab('tab-info')
                tabContent.innerHTML = `
                <div class="info-content">
                    <div class="card-content-desc">
                        <h2 class="card-title" style="color: ${cardColor};">${player.name}</h2>
                        <div class="card-body">
                            <div class="card-parameters">
                                ${parametersHTML}
                            </div>
                            <div class="card-gear">
                                ${equipmentHTML}
                            </div>
                        </div>
                    </div>
                </div>`
            }
            tabTutorial.onclick = () => {
                setActiveTab('tab-tutorial')
                tabContent.innerHTML = `
                <div class="tutorial-content">
                    <div class="card-content-desc">
                        <h2 class="card-title" style="color: ${cardColor};">Tutorial</h2>
                        <div class="card-body">
                            <p>Aquí se muestra la información del tutorial.</p>
                        </div>
                    </div>
                </div>`
            }
            tabVIT.onclick = () => {
                setActiveTab('tab-status-vit')
                tabContent.innerHTML = `
                <div class="vit-content">
                    <div class="card-content-desc">
                        <h2 class="card-title" style="color: ${cardColor};">Resistencia</h2>
                        <div class="card-body">
                            <p>Información detallada sobre la resistencia del personaje.</p>
                        </div>
                    </div>
                </div>`
            }
            tabAGI.onclick = () => {
                setActiveTab('tab-status-agi')
                tabContent.innerHTML = `
                <div class="agi-content">
                    <div class="card-content-desc">
                        <h2 class="card-title" style="color: ${cardColor};">Versatilidad</h2>
                        <div class="card-body">
                            <p>Información detallada sobre la agilidad y versatilidad del personaje.</p>
                        </div>
                    </div>
                </div>`
            }
            tabWIS.onclick = () => {
                setActiveTab('tab-status-wis')
                tabContent.innerHTML = `
                <div class="wis-content">
                    <div class="card-content-desc">
                        <h2 class="card-title" style="color: ${cardColor};">Mentalidad</h2>
                        <div class="card-body">
                            <p>Información detallada sobre la sabiduría y mentalidad del personaje.</p>
                        </div>
                    </div>
                </div>`
            }
        }
    }

    renderCard()
}


export function showQuestLog(scene, player) {
    const container = document.createElement('div')
    container.id = 'inventoryMenuContainer'  // Reutiliza el estilo del inventario

    const header = document.createElement('div')
    header.id = 'inventoryHeader'
    header.textContent = 'Registro de Misiones - Activas'
    container.appendChild(header)


    // Crear barra de pestañas para filtrar las misiones
    const tabBar = document.createElement('div')
    tabBar.id = 'inventoryTabBar'
    const tabs = [
        { label: '', name: 'Activas', category: 'active', icon: '☀️' },
        { label: '', name: 'Principales', category: 'main', icon: '🥇' },
        { label: '', name: 'Secundarias', category: 'secondary', icon: '🥈' },
        { label: '', name: 'Especiales', category: 'special', icon: '⭐️' },
        { label: '', name: 'Completadas', category: 'completed', icon: '🏆' }
    ]
    tabs.forEach(tab => {
        const btn = document.createElement('button')
        btn.textContent = `${tab.icon} ${tab.label}`
        btn.onclick = () => {   
            Array.from(tabBar.children).forEach(child => child.classList.remove('selected'))
            btn.classList.add('selected')
            header.textContent = `Registro de Misiones - ${tab.name}`
            updateContent(tab.category)
        }
        tabBar.appendChild(btn)
    })
    container.appendChild(tabBar)

    const contentArea = document.createElement('div')
    contentArea.id = 'inventoryContent'
    container.appendChild(contentArea)

    function updateContent(selectedCategory) {
        contentArea.innerHTML = ''

        let filteredQuests = []
        if (selectedCategory === 'active') {
            filteredQuests = player.quests.filter(q => !q.completed)
        } else if (selectedCategory === 'main') {
            filteredQuests = player.quests.filter(q => q.type === 'main' && !q.completed)
        } else if (selectedCategory === 'secondary') {
            filteredQuests = player.quests.filter(q => q.type === 'secondary' && !q.completed)
        } else if (selectedCategory === 'special') {
            filteredQuests = player.quests.filter(q => q.type === 'special' && !q.completed)
        } else if (selectedCategory === 'completed') {
            filteredQuests = player.quests.filter(q => q.completed)
        } else {
            filteredQuests = player.quests
        }

        if (filteredQuests.length === 0) {
            const msg = document.createElement('p')
            msg.textContent = "No tienes misiones en esta categoría."
            contentArea.appendChild(msg)
        } else {
            filteredQuests.forEach(quest => {
                const btn = document.createElement('button')
                btn.className = 'inventoryRow'  // Reutiliza el estilo existente
                const icon = getQuestLogIcon(quest)
                btn.textContent = `${icon} ${quest.title}`
                btn.title = `Detalles: ${quest.description}\nRecompensas: ${quest.rewards}`
                btn.onclick = () => {
                    showQuestDetail(scene, player, quest)
                }
                contentArea.appendChild(btn)
            })
        }
    }
    
    updateContent('active')  // Por defecto, mostrar misiones activas

    const footer = document.createElement('div')
    footer.id = 'inventoryFooter'
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.onclick = () => {
        const detail = document.getElementById('questDetailContainer')
        if (detail) detail.remove()
        container.remove()
        showScenarioMenu(scene)
    }
    footer.appendChild(backBtn)
    container.appendChild(footer)

    document.body.appendChild(container)
}

function getQuestLogIcon(quest) {
    if (quest.completed) return "❓"           // Misión completada: entregar para cobrar recompensas
    if (quest.type === 'main') return "❗️"      // Misión principal activa
    if (quest.type === 'secondary') return "❕" // Misión secundaria activa
    if (quest.type === 'special') return "⭐️"   // Misión especial activa
    return "❔"                                 // Por defecto, misión pendiente
}

function showQuestDetail(scene, player, quest) {
    const detailContainer = document.createElement('div')
    detailContainer.id = 'questDetailContainer'  // Reutiliza el estilo del menú de inventario

    // Cabecera con el título de la misión
    const header = document.createElement('div')
    header.id = 'inventoryHeader'
    header.textContent = quest.title
    detailContainer.appendChild(header)

    // Área de contenido para la descripción, recompensas y estado
    const contentArea = document.createElement('div')
    contentArea.id = 'inventoryContent'
    contentArea.innerHTML = `
        <p>${quest.description}</p>
        <p><strong>Recompensa:</strong> ${quest.rewards}</p>
        <p><strong>Estado:</strong> ${quest.completed ? 'Completada' : 'En progreso'}</p>
    `
    detailContainer.appendChild(contentArea)

    // Contenedor de pie para el botón "Volver"
    const footer = document.createElement('div')
    footer.id = 'inventoryFooter'
    const detailsBackBtn = document.createElement('button')
    detailsBackBtn.textContent = 'Volver'
    detailsBackBtn.onclick = () => {
        detailContainer.remove()
        // Al cerrar el detalle, se puede volver al registro de misiones

    }
    footer.appendChild(detailsBackBtn)
    detailContainer.appendChild(footer)

    document.body.appendChild(detailContainer)
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
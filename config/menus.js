import CONFIG from "./config.js"


/**
 * Crea un contenedor de menú con botones para cada opción
 * @param {string[]} options - Array de opciones (texto) a mostrar
 * @param {function(string):void} onSelect - Callback que recibe la opción seleccionada
 */
export function showMenu(options, onSelect) {
    const menuContainer = document.createElement('div')
    menuContainer.id = 'menuContainer'
    // Estilos mínimos para posicionar el menú sobre la escena


    options.forEach(option => {
        const btn = document.createElement('button')
        btn.textContent = option
        btn.style.fontFamily = CONFIG.TEXT.FONT   // Usa la misma fuente que la textbox
        btn.style.fontSize = '32px'
        btn.style.padding = '10px 15px'
        btn.onclick = () => {
            document.body.removeChild(menuContainer)
            onSelect(option)
        }
        menuContainer.appendChild(btn)
    })

    document.body.appendChild(menuContainer)
}

/**
 * Muestra el menú de tienda con opciones:
 *   ['🛒 Comprar', '💰 Vender', '🗣️ Hablar', '🚪 Salir'].
 * Si se selecciona "Salir", se regresa al menú general del escenario.
 * @param {Phaser.Scene} scene
 */
export function showShopMenu(scene) {
    showMenu(['🛒 Comprar', '💰 Vender', '🗣️ Hablar', '🚪 Salir'], selection => {
        console.log(`Opción de tienda seleccionada: ${selection}`)
        if (selection === '🚪 Salir') {
            showScenarioMenu(scene)
        } else {
            // Aquí implementarías la lógica de compra, venta o volver a hablar
            alert(`Funcionalidad "${selection}" no implementada aún.`)
            // Vuelve a mostrar el menú de tienda
            showShopMenu(scene)
        }
    })
}

/**
 * Muestra el menú general del escenario con opciones:
 *   ['🗣️ Hablar', '🔍 Explorar', '🛤️ Viajar', '🎒 Inventario', '📊 Estado'].
 * Según la opción elegida se invoca la acción correspondiente.
 * @param {Phaser.Scene} scene
 */
export function showScenarioMenu(scene) {
    showMenu(['🗣️ Hablar', '🔍 Explorar', '🛤️ Viajar', '🎒 Inventario', '📊 Estado'], selection => {
        console.log(`Opción de escenario seleccionada: ${selection}`)
        switch (selection) {
            case '🗣️ Hablar':
                showNPCSubMenu(scene)
                break
            case '🔍 Explorar':
                alert('Funcionalidad "Explorar" no implementada aún.')
                showScenarioMenu(scene)
                break
            case '🛤️ Viajar':
                alert('Funcionalidad "Viajar" no implementada aún.')
                showScenarioMenu(scene)
                break
            case '🎒 Inventario':
                alert('Funcionalidad "Inventario" no implementada aún.')
                showScenarioMenu(scene)
                break
            case '📊 Estado':
                alert('Funcionalidad "Estado" no implementada aún.')
                showScenarioMenu(scene)
                break
            default:
                showScenarioMenu(scene)
                break
        }
    })
}

/**
 * Muestra un submenú con los NPCs presentes en el escenario para elegir a quién hablar.
 * Se asume que en la escena existe un array scene.npcs con los NPCs disponibles.
 * @param {Phaser.Scene} scene
 */
export function showNPCSubMenu(scene) {
    const container = document.createElement('div')
    container.id = 'npcTalkMenuContainer'
    // Los estilos se aplican vía CSS

    // Recorremos los NPCs existentes en la escena
    scene.npcs.forEach(npc => {
        const row = document.createElement('div')
        row.className = 'npcRow'
        
        const affinity = (npc.affinity !== undefined) ? npc.affinity : 'N/A'
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
                 // Remueve el menú actual y muestra el menú de la tienda
                 document.body.removeChild(container)
                 showStoreMenu(scene, npc)
            }
            btnContainer.appendChild(buyBtn)
            
            const sellBtn = document.createElement('button')
            sellBtn.textContent = '💰'
            sellBtn.onclick = () => {
                 alert(`Funcionalidad de venta para ${npc.name} no implementada aún`)
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

    // Botón para volver al menú anterior
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backButton'
    backBtn.onclick = () => {
        document.body.removeChild(container)
        showScenarioMenu(scene)
    }
    container.appendChild(backBtn)

    document.body.appendChild(container)
}

/**
 * Al finalizar los diálogos se invoca esta función para mostrar el menú adecuado.
 * Se puede distinguir, por ejemplo, si el último diálogo tenía propiedad "shop" (true)
 * para mostrar el menú de tienda; de lo contrario se muestra el menú general del escenario.
 * @param {Phaser.Scene} scene
 */
export function showPostDialogueMenu(scene) {
    const lastDialog = scene.dialogs ? scene.dialogs[scene.currentIndex - 1] : null
    if (lastDialog && lastDialog.shop) {
        showShopMenu(scene)
    } else {
        showScenarioMenu(scene)
    }
}

/**
 * Muestra un menú con los objetos a la venta del NPC.
 * Se recorre la propiedad store del NPC y se buscan los datos de cada objeto.
 * @param {Phaser.Scene} scene
 * @param {Object} npc - El NPC con tienda (shop: true)
 */
export function showStoreMenu(scene, npc) {
    const container = document.createElement('div')
    container.id = 'storeMenuContainer'
    // Los estilos se aplican vía CSS

    // Obtener el nivel de afinidad del jugador (valor por defecto 0 si no está definido)
    const playerAffinity = scene.playerAffinity || 4

    const storeItems = npc.store || []
    // Filtrar solo los items cuyo requerimiento de afinidad sea menor o igual al del jugador
    const availableItems = storeItems.filter(item => item.affinity <= playerAffinity)

    if (availableItems.length === 0) {
        const msg = document.createElement('p')
        msg.textContent = "No hay artículos a la venta disponibles para tu afinidad"
        container.appendChild(msg)
    } else {
        availableItems.forEach(storeItem => {
            // Obtener los datos completos del item usando su categoría e id
            const itemData = getItemData(storeItem.cat, storeItem.id)

            // Si en la tienda se especifica un nombre, se usa; de lo contrario, se utiliza el del item
            const itemName = storeItem.name || (itemData ? itemData.name : 'Item desconocido')

            // Obtenemos el precio del objeto del json
            const buyPrice = itemData && itemData.price ? itemData.price.buy : '?'

            // Se obtiene el icono (si lo hay)
            const icon = itemData && itemData.icon ? itemData.icon : ''

            // Crear la fila para el item
            const row = document.createElement('div')
            row.className = 'storeRow'

            // Crear un span que muestre la información del item
            const infoSpan = document.createElement('span')
            // No mostramos la afinidad, solo el icono, el nombre y el precio
            infoSpan.textContent = `${icon} ${itemName} ${buyPrice}g`
            row.appendChild(infoSpan)

            // Crear un botón para comprar
            const buyBtn = document.createElement('button')
            buyBtn.textContent = 'Comprar'
            buyBtn.onclick = () => {
                // Aquí colocar la lógica de compra
                alert(`Compraste ${itemName} por ${buyPrice}`)
            }
            row.appendChild(buyBtn)

            container.appendChild(row)
        })
    }

    // Botón para volver al menú anterior (por ejemplo, al submenú de NPC)
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backButton'
    backBtn.onclick = () => {
        container.remove()
        showNPCSubMenu(scene)
    }
    container.appendChild(backBtn)

    document.body.appendChild(container)
}

/**
 * Función auxiliar para obtener los datos de un item dado su categoría y id.
 * Se asume que window.itemDB está inicializado con los JSON de items.
 * @param {string} cat - Categoría del item (por ejemplo, "usable", "misc", etc.)
 * @param {string} id - ID del item.
 * @returns {Object|null} Datos del item o null si no se encuentra.
 */
function getItemData(cat, id) {
    if (window.itemDB && window.itemDB[cat]) {
        let data = window.itemDB[cat]
        // Si el objeto data tiene una clave igual a la categoría, usamos ese objeto interno
        if (data.hasOwnProperty(cat)) {
            data = data[cat]
        }
        return data[id] || null
    }
    return null
}
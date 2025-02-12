import CONFIG from "./config.js"



export function showMenu(options, onSelect) {
    // Estilos mínimos para posicionar el menú sobre la escena
    const menuContainer = document.createElement('div')
    menuContainer.id = 'menuContainer'


    options.forEach(option => {
        const btn = document.createElement('button')

        btn.textContent = option

        btn.style.fontFamily = CONFIG.TEXT.FONT
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




export function showShopMenu(scene) {
    showMenu(['🛒 Comprar', '💰 Vender', '🗣️ Hablar', '🚪 Salir'], selection => {
        console.log(`Opción de tienda seleccionada: ${selection}`)

        if (selection === '🚪 Salir') {
            showScenarioMenu(scene)

        } else {
            alert(`Funcionalidad "${selection}" no implementada aún.`)

            // Vuelve a mostrar el menú de tienda
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
                alert(`Funcionalidad "${selection}" no implementada aún.`)
                showScenarioMenu(scene)

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



// Muestra un submenú con los NPCs presentes en el escenario
export function showNPCSubMenu(scene) {
    const container = document.createElement('div')
    container.id = 'npcTalkMenuContainer'

    // Recorremos los NPCs existentes en la escena
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
                 // Remueve el menú actual y muestra el menú de la tienda
                 document.body.removeChild(container)
                 showStoreMenu(scene, npc)

            }

            btnContainer.appendChild(buyBtn)
            

            const sellBtn = document.createElement('button')

            sellBtn.textContent = '💰'
            sellBtn.onclick = () => {
                 alert(`${npc.name} no implementada aún`)

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



// Muestra el menú de tienda si está disponible.
export function showPostDialogueMenu(scene) {
    const lastDialog = scene.dialogs ? scene.dialogs[scene.currentIndex - 1] : null


    return (lastDialog && lastDialog.shop) ? showShopMenu(scene) : showScenarioMenu(scene)

}




// Muestra un menú con los objetos a la venta del NPC si el npc tiene una tienda (shop: true)
// Se recorre la propiedad "store" del NPC y se buscan los datos de cada objeto.
export function showStoreMenu(scene, npc) {
    const container = document.createElement('div')
    container.id = 'storeMenuContainer'

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
            infoSpan.textContent = `${icon} ${itemName} ${buyPrice}s`


            row.appendChild(infoSpan)


            // Crear un botón para comprar
            const buyBtn = document.createElement('button')
            buyBtn.textContent = 'Comprar'

            buyBtn.onclick = () => {
                alert(`Has comprado ${itemName} por ${buyPrice}`)

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




function getItemData(cat, id) {
    if (window.itemDB && window.itemDB[cat]) {
        let data = window.itemDB[cat]

        // Si el objeto data tiene una clave igual a la categoría, lo usamos
        if (data.hasOwnProperty(cat)) {
            data = data[cat]

        }


        return data[id] || null
    }


    return null
}
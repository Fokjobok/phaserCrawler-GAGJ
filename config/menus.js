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


    // Botón para volver al menú anterior
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backButton'
    backBtn.onclick = () => {
        container.remove()
        // Llamar a showScenarioMenu importada, no como método de scene
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


export function showTravelMenu(scene) {
    // Elimina menú anterior si existe
    const existing = document.getElementById('travelMenuContainer')
    if (existing) existing.remove()
  
    const container = document.createElement('div')
    container.id = 'travelMenuContainer'
  
    // Función auxiliar para obtener la URL del fondo según la extensión
    function getBackgroundURL(background) {
      // Si ya tiene extensión, se usa directamente
      if (background.endsWith('.webp') || background.endsWith('.png'))
        return `assets/backgrounds/${background}`
      // Lista de fondos que se asumen en formato webp (ajusta según tu proyecto)
      const webpBackgrounds = ['dungate', 'nforest']
      return webpBackgrounds.includes(background)
        ? `assets/backgrounds/${background}.webp`
        : `assets/backgrounds/${background}.png`
    }
  
    // Filtrar escenarios: se excluye el actual
    const scenarioKeys = Object.keys(scene.scenarioData).filter(key => key !== scene.currentScenarioKey)
  
    scenarioKeys.forEach(key => {
      const scenario = scene.scenarioData[key]
      const row = document.createElement('div')
      row.classList.add('travelRow')
      if (scenario.background)
        row.style.backgroundImage = `url(${getBackgroundURL(scenario.background)})`
  
      // Nombre del escenario
      const nameSpan = document.createElement('span')
      nameSpan.textContent = scenario.name
      row.appendChild(nameSpan)
  
      // Botón "Visitar"
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
  
    // Botón "Volver"
    const backBtn = document.createElement('button')
    backBtn.textContent = 'Volver'
    backBtn.className = 'backBtn'
    backBtn.onclick = () => {
        container.remove()
        // Llamar a showScenarioMenu importada, no como método de scene
        showScenarioMenu(scene)
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
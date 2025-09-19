import CONFIG from "../config/config.js"
import { initNpcData } from "../src/character/npc.js"


export function create_dialogContainer(scene) {
    scene.dialogContainer = document.createElement('div')
    scene.dialogContainer.className = 'dialogContainer'

    scene.dialogContainer.style.position = 'absolute'
    scene.dialogContainer.style.top      = '0'
    scene.dialogContainer.style.left     = '0'
    scene.dialogContainer.style.width    = '100%'
    scene.dialogContainer.style.height   = '100%'
    document.body.appendChild(scene.dialogContainer)
    console.log("Dialog container created.")
}


export function create_textBox(scene) {
    // Contenedor visible con fondo y borde; permite overflow visible para que el speaker sobresalga
    scene.textbox = document.createElement('div')
    scene.textbox.className = 'textbox'
    scene.textbox.style.fontFamily = CONFIG.TEXT.FONT
    scene.textbox.style.fontSize = CONFIG.TEXT.SIZE
    scene.textbox.style.color = CONFIG.TEXT.COLOR

    // Contenido interno scrollable; aquí se escribe el texto
    scene.textboxText = document.createElement('div')
    scene.textboxText.className = 'textbox-content'

    scene.textbox.appendChild(scene.textboxText)
    scene.dialogContainer.appendChild(scene.textbox)
    console.log("Textbox creada con contenedor interno.")
}


export function create_npcImage(scene) {
    scene.npcImage = document.createElement("img")
    scene.npcImage.className = "npcImage"

    // Append NPC image to the dialog container
    scene.dialogContainer.appendChild(scene.npcImage)
    console.log("Imagen NPC creada.")
}


export function create_speakerNameBox(scene) {
    scene.speakerNameBox = document.createElement("div")
    scene.speakerNameBox.className = "speakerNameBox-dialog"

    // Insertar dentro de la textbox para posicionamiento relativo estable (y que sobresalga por arriba)
    if (scene.textbox) {
        scene.textbox.appendChild(scene.speakerNameBox)
    } else {
        // Fallback por si el orden de creación cambiara
        scene.dialogContainer.appendChild(scene.speakerNameBox)
    }
    console.log("speakerNameBox creado dentro de la textbox.")
}


// Carga los datos del escenario y de los NPCs
export function create_scenarioData(scene) {
    scene.scenarioData = scene.cache.json.get("scenario_db")
    const raw = scene.cache.json.get("npc_predefined")

    if (!scene.scenarioData) {
        console.error("No se pudo cargar scenario_db.json"); return
    }
    if (!raw) {
        console.error("No se pudo cargar npc_predefined.json"); return
    }

    initNpcData({
        predefinedNpcs: raw.predefinedNpcs,
        storesDatabase: raw.storesDatabase
    })

    console.log("Datos del escenario y NPCs inicializados correctamente.")
}


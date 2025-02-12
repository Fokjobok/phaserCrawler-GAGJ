import CONFIG from "../config/config.js"
import { initNpcData } from "../src/character/npc.js"





export function create_dialogContainer(scene) {
	scene.dialogContainer = document.createElement('div')
	scene.dialogContainer.className = 'dialogContainer'
	// Adjust container style to keep dialog elements together
	scene.dialogContainer.style.position = 'relative'
	scene.dialogContainer.style.width = '100%'
	document.body.appendChild(scene.dialogContainer)
	console.log("✅ Dialog container created.")
}


export function create_textBox(scene) {
	scene.textboxText = document.createElement('div')
	scene.textboxText.className = 'textbox'
	scene.textboxText.style.fontFamily = CONFIG.TEXT.FONT
	scene.textboxText.style.fontSize = CONFIG.TEXT.SIZE
	scene.textboxText.style.color = CONFIG.TEXT.COLOR
	scene.textboxText.style.width = "95%"
	scene.textboxText.style.maxWidth = "1600px"
	scene.textboxText.style.height = "160px"
	scene.textboxText.style.overflow = "hidden"
	// Append textbox to the dialog container instead of directly to document.body
	scene.dialogContainer.appendChild(scene.textboxText)
	console.log("☑️ Textbox creada.")
}



export function create_npcImage(scene) {
	scene.npcImage = document.createElement("img")
	scene.npcImage.className = "npcImage"
	scene.npcImage.style.minWidth = "34%"
	scene.npcImage.style.maxWidth = "42%"
	// Append NPC image to the dialog container
	scene.dialogContainer.appendChild(scene.npcImage)
	console.log("☑️ Imagen NPC creada.")
}

/**
 * 🔹 Creates the speaker name box (for NPC or Narrator)
 * @param {Phaser.Scene} scene - The scene in which the speaker name will be shown
 */
export function create_speakerNameBox(scene) {
	scene.speakerNameBox = document.createElement("div")
	scene.speakerNameBox.className = "speakerNameBox"
	// Append speaker name box to the dialog container
	scene.dialogContainer.appendChild(scene.speakerNameBox)
	console.log("☑️ speakerNameBox creado.")
}




//🔹 Carga los datos del escenario y de los NPCs
export function create_scenarioData(scene) {
    scene.scenarioData = scene.cache.json.get("scenario_db") // ✅ Carga los datos del escenario
    const npcPredefinedData = scene.cache.json.get("npc_predefined") // ✅ Carga los NPCs

    if (!scene.scenarioData) {
        console.error("❌ Error: No se pudo cargar scenario_db.json")


        return
    }

    if (!npcPredefinedData) {
        console.error("❌ Error: No se pudo cargar npc_predefined.json")


        return
    }


    initNpcData({ predefinedNpcs: npcPredefinedData }) // 🔹 Inicializa la data de NPCs

    console.log("☑️ Datos del escenario y NPCs inicializados correctamente.")
}
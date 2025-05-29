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
	console.log("✅ Dialog container created.")
}


export function create_textBox(scene) {
	scene.textboxText = document.createElement('div')
	scene.textboxText.className = 'textbox'
	scene.textboxText.style.fontFamily = CONFIG.TEXT.FONT
	scene.textboxText.style.fontSize = CONFIG.TEXT.SIZE
	scene.textboxText.style.color = CONFIG.TEXT.COLOR
	scene.textboxText.style.width = "92%"
	scene.textboxText.style.height = "160px"
	scene.textboxText.style.overflow = "hidden"

	scene.dialogContainer.appendChild(scene.textboxText)
	console.log("☑️ Textbox creada.")
}



export function create_npcImage(scene) {
	scene.npcImage = document.createElement("img")
	scene.npcImage.className = "npcImage"

	// Append NPC image to the dialog container
	scene.dialogContainer.appendChild(scene.npcImage)
	console.log("☑️ Imagen NPC creada.")
}




export function create_speakerNameBox(scene) {
	scene.speakerNameBox = document.createElement("div")
	scene.speakerNameBox.className = "speakerNameBox-dialog"

	scene.dialogContainer.appendChild(scene.speakerNameBox)
	console.log("☑️ speakerNameBox creado.")
}




// Carga los datos del escenario y de los NPCs
export function create_scenarioData(scene) {
    scene.scenarioData = scene.cache.json.get("scenario_db")
	const raw = scene.cache.json.get("npc_predefined")

    if (!scene.scenarioData) {
		console.error("❌ No se pudo cargar scenario_db.json"); return
	}
    if (!raw) {
		console.error("❌ No se pudo cargar npc_predefined.json"); return
	}

	initNpcData({
        predefinedNpcs: raw.predefinedNpcs,
        storesDatabase: raw.storesDatabase
    })


    console.log("☑️ Datos del escenario y NPCs inicializados correctamente.")
}
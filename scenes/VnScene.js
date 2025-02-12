import CONFIG from "../config/config.js"

import { preload_bgScenario, preload_textBox, preload_styleMenu } from "../config/preload.js"
import { create_npcImage, create_scenarioData, create_speakerNameBox, create_textBox, create_dialogContainer } from "../config/create.js"

import { showDialog, resize_bg } from "../config/dialogs_config.js"

import { initNpcData, generateNpc, generatePredefinedNpc } from "../src/character/npc.js"

import { showMenu, showShopMenu, showNPCSubMenu, showPostDialogueMenu } from "../config/menus.js"

export function visitScenario(scene, scenarioKey) {
    if (!scene.scenarioData) {
        console.error("❌ Error: scene.scenarioData no está definido antes de visitar un escenario.")
        return
    }

    const scenarioObj = scene.scenarioData[scenarioKey]

    if (!scenarioObj) {
        console.error(`❌ Escenario '${scenarioKey}' no existe en scenario_db.json`)
        return
    }

    const bgScenario = scenarioObj.background || "black"

    if (scene.textures.exists(bgScenario)) {
        if (!scene.bg) {
            scene.bg = scene.add.image(640, 360, bgScenario).setOrigin(0.5, 0.5)
        } else {
            scene.bg.setTexture(bgScenario)
        }
        resize_bg(scene)
    } else {
        console.error(`❌ Error: La imagen de fondo '${bgScenario}' no está cargada.`)
    }

    if (!scenarioObj.visited) {
        scenarioObj.visited = true

        if (scenarioObj.force_dialogue && scenarioObj.permanent_npc_ids?.length > 0) {
            let firstId = scenarioObj.permanent_npc_ids[0]
            let npc = generatePredefinedNpc(firstId)
            if (npc) {
                scene.startScenarioIntro(npc, scenarioObj)
            }
        }
    } else {
        console.log(`🔹 Escenario '${scenarioKey}' ya visitado: no forzamos nueva conversación.`)
    }

    console.log("🔍 Revisando background:", scenarioObj.background) 

    // Asignar los NPCs del escenario
    scene.npcs = []  // Reiniciamos el array para este escenario

    // Agregar NPC permanentes a partir de permanent_npc_ids
    if (scenarioObj.permanent_npc_ids && scenarioObj.permanent_npc_ids.length > 0) {
        scenarioObj.permanent_npc_ids.forEach(id => {
            let npc = generatePredefinedNpc(id)
            if (npc) {
                scene.npcs.push(npc)
            }
        })
    }

    // Si el total de NPCs (npc_count) es mayor que la cantidad de permanentes, se generan NPC efímeros
    while (scene.npcs.length < scenarioObj.npc_count) {
        let ephemeral = generateNpc(scenarioObj.role_category, scenarioObj.npc_type)
        if (ephemeral) {
            scene.npcs.push(ephemeral)
        } else {
            console.warn("No se pudo generar un NPC efímero; saliendo del bucle")
            break
        }
    }
}



export class VnScene extends Phaser.Scene {
    constructor() {
        super({ key: "VnScene" })

        this.currentScenarioKey = "el mercado"  

    }

    preload() {

        // 1) Cargamos JSON
        this.load.json("scenario_db", "src/database/scenarios/scenario_db.json")

        this.load.json("npc_names", "src/database/npc/npc_names.json")
        this.load.json("npc_roles", "src/database/npc/npc_roles.json")
        this.load.json("npc_chances", "src/database/npc/npc_chances.json")
        this.load.json("npc_dialogs", "src/database/npc/npc_dialogs.json")
        this.load.json("npc_appearances", "src/database/npc/npc_appearances.json")

        this.load.json("npc_predefined", "src/database/npc/npc_predefined.json")


        this.load.json("accessory_db", "src/database/items/gear/db/accessory_db.json")
        this.load.json("armor_db", "src/database/items/gear/db/armor_db.json")
        this.load.json("weapon_db", "src/database/items/gear/db/weapon_db.json")
        this.load.json("shield_db", "src/database/items/gear/db/shield_db.json")

        this.load.json("consumible", "src/database/items/common/db/consumible.json")
        this.load.json("usable", "src/database/items/common/db/usable.json")
        this.load.json("misc", "src/database/items/common/db/misc.json")
        
        // 2) Cargamos imágenes
        preload_bgScenario(this)



		// Cargar el CSS para la textbox
        preload_textBox(this)
        preload_styleMenu(this)
    }

    create() {
        // ✅ Cargar la caja de diálogo y demás elementos
        create_dialogContainer(this)
        create_textBox(this)
        create_npcImage(this)
        this.scale.on('resize', () => resize_bg(this))
        create_speakerNameBox(this)
        
        // ✅ Cargar datos de escenarios y NPCs
        create_scenarioData(this)
        
        const dataForNPCs = {
            npcNames: this.cache.json.get("npc_names"),
            npcRole: this.cache.json.get("npc_roles"),
            npcChance: this.cache.json.get("npc_chances"),
            npcDialogs: this.cache.json.get("npc_dialogs"),
            npcAppearance: this.cache.json.get("npc_appearances"),
            predefinedNpcs: this.cache.json.get("npc_predefined")
        }

        window.itemDB = {
            consumible: this.cache.json.get("consumible"),     // desde /database/items/common/db/consumible.json
            misc: this.cache.json.get("misc"),                 // desde /database/items/common/db/misc.json
            usable: this.cache.json.get("usable"),             // desde /database/items/common/db/usable.json
            accessory: this.cache.json.get("accessory_db"),    // desde /database/items/gear/db/accessory_db.json
            armor: this.cache.json.get("armor_db"),            // desde /database/items/gear/db/armor_db.json
            weapon: this.cache.json.get("weapon_db"),          // desde /database/items/gear/db/weapon_db.json
            shield: this.cache.json.get("shield_db")           // desde /database/items/gear/db/shield_db.json
        }


        initNpcData(dataForNPCs)

        this.npcs = []
        // ✅ Cargar fondo dinámicamente basado en el escenario
        visitScenario(this, this.currentScenarioKey)
        

        console.log("dataForNPCs:", dataForNPCs)
        initNpcData(dataForNPCs)
        
        






        this.input.keyboard.on("keydown-Z", () => {
            console.log("🟢 Libre movimiento.")


        })
    }


    // startNPCDialog(npc): Crea this.dialogs y llama a showDialog(this)

    startNPCDialog(npc) {
        console.log(`🔸 Iniciando diálogo con NPC: ${npc.name}`)
        
        this.currentIndex = 0
        const randomIndex = Math.floor(Math.random() * npc.dialogues.length)
        const randomLine = npc.dialogues[randomIndex]
        this.dialogs = [{
            text: [randomLine],
            speakerName: npc.name,
            image: `assets/npcs/${npc.image_path}.png`
        }]
        
        showDialog(this)
    }

    startScenarioIntro(npc, scenarioObj) {
        console.log(`🔸 Iniciando introducción del escenario: ${scenarioObj.name}`)
    
        this.currentIndex = 0
    
        // Si el escenario no tiene 'intro', se usa la del NPC
        let introTexts = scenarioObj.intro || npc.intro || []
        let introDialogues = introTexts.map(line => ({
            text: [line],
            speakerName: "Narrador",
            image: ""  // No hay imagen para el narrador
        }))
    
        let npcForceDialogues = npc.dialogues_force?.map(line => ({
            text: [line],
            speakerName: npc.name,
            image: `assets/npcs/${npc.image_path}.png`
        })) || []
    
        this.dialogs = [...introDialogues, ...npcForceDialogues]
    
        showDialog(this)
    }


}


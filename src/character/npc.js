export let allNpcs = {}
import { assignQuest, applyQuestChanges } from "../questManager.js"
// Datos externos (JSON) que debes cargar en tu escena o en index.js antes de usar estas funciones
// Ejs: npcNames, npcRole, npcChance, npcDialogs, npcAppearance, predefinedNpcs
// Se asume que tu escena Phaser los importará o los guardará en variables globales

let npcNames = null
let npcRole = null
let npcChance = null
let npcDialogs = null
let npcAppearance = null
let predefinedNpcs = null
let npcQuests = null
let questDefs = null

export function initNpcData(data) {

    if (data.npcNames       !== undefined) npcNames       = data.npcNames
    if (data.npcRole        !== undefined) npcRole        = data.npcRole
    if (data.npcChance      !== undefined) npcChance      = data.npcChance
    if (data.npcDialogs     !== undefined) npcDialogs     = data.npcDialogs
    if (data.npcAppearance  !== undefined) npcAppearance  = data.npcAppearance
    if (data.predefinedNpcs !== undefined) predefinedNpcs = data.predefinedNpcs
    if (data.npcQuests      !== undefined) npcQuests      = data.npcQuests
    if (data.questDefs      !== undefined) questDefs      = data.questDefs

    Object.keys(predefinedNpcs).forEach(npcKey => {
        let npcData = predefinedNpcs[npcKey]
        if (npcData.shop && npcData.store) {
            npcData.store = assignStoreQuantity(npcData.store)
        }
    })
	console.log("initNpcData cargó la info de NPCs:", data)
    console.log("initNpcData:", { npcQuests, questDefs })
}

/*
Clase NPC que representa un personaje no jugable,
*/
export class NPC {
    constructor({
        id_npc,
        name,
        gender,
        role_category,
        role,
        days_left,
        appearance,
        dialogues = [],
        intro = [],
        dialogues_force = [],
        quest = false,
        option_unlocked = false,
        unlock_option = null,
        interaction_types = [],
        image_path = null,
        shop = false,
        store = []
    }) {
        this.id_npc = id_npc
        this.name = name
        this.gender = gender
        this.role_category = role_category
        this.role = role
        this.days_left = days_left
        this.appearance = appearance
        this.dialogues = dialogues
        this.intro = intro
        this.dialogues_force = dialogues_force
        this.quest = quest
        this.option_unlocked = option_unlocked
        this.unlock_option = unlock_option
        this.interaction_types = interaction_types
        this.image_path = image_path
        this.shop = shop
        this.store = store

        this.mission = null

        this.determineInteraction()
        this.generateDialog()
    }

    // Método para asignar una misión al NPC
    setMission(mission) {
        this.mission = mission
    }




	daysReducer() {
		this.days_left--
	}

	generateDialog() {
		// Si no se definieron diálogos, cargar desde npcDialogs segun la categoría y rol
		if (!this.dialogues || this.dialogues.length === 0) {
			let cat = npcDialogs?.[this.role_category]
			if (cat) {
				let arr = cat[this.role.toLowerCase()]
				if (arr && arr.length > 0) {
					this.dialogues = arr
					return
				}
			}
			this.dialogues = ["¿Qué miras, payaso?"]
		}
	}

	determineInteraction() {
		// Basado en npcChance, determina los tipos de interacción
		let chances = npcChance?.[this.role_category] || {}
		let interactions = []
		Object.keys(chances).forEach(interactionType => {
			let probability = chances[interactionType]
			
			if (Math.random() < probability) {
				interactions.push(interactionType)
			}
		})
		if (interactions.length === 0) {
			interactions.push('dialog')
		}
		this.interaction_types = interactions
	}
}


export function saveNpcsLocal() {
	let npcObj = {}
	Object.keys(allNpcs).forEach(id => {
		npcObj[id] = { ...allNpcs[id] }
	})
	let jsonString = JSON.stringify(npcObj)
	window.localStorage.setItem("all_npcs", jsonString)
}

export function loadNpcsLocal() {
	let data = window.localStorage.getItem("all_npcs")
	if (!data) {
		console.log("No se encontraron NPCs en localStorage")
		return
	}
	let npcObj = JSON.parse(data)
	Object.keys(npcObj).forEach(id => {
		let info = npcObj[id]
		// Crea un NPC:
		let npc = new NPC(info)
		allNpcs[id] = npc
	})
}
/*
Genera un NPC predefinido según la entrada en predefinedNpcs
*/
export function generatePredefinedNpc(npcId) {
    if (!predefinedNpcs) {
        console.error("No se ha inicializado npc_predefined. Llama a initNpcData primero")
        return null
    }
    let npcData = predefinedNpcs[npcId]
    if (!npcData) {
        throw new Error(`NPC predefinido '${npcId}' no existe en predefinedNpcs`)
    }

    let newNpc = new NPC({
        id_npc: npcId,
        name: npcData.name,
        gender: npcData.gender,
        role_category: npcData.role_category,
        role: npcData.role,
        days_left: -1,
        appearance: npcData.appearance,
        dialogues: npcData.dialogues,
        intro: npcData.intro,
        dialogues_force: npcData.dialogues_force,
        quest: npcData.quest || false,
        option_unlocked: npcData.option_unlocked || false,
        unlock_option: npcData.unlock_option || null,
        interaction_types: npcData.interaction_types || [],
        image_path: npcData.image_path || null,
        shop: npcData.shop || false,
        store: npcData.store || []
    })

    
    const cfg = npcQuests[npcId]
    
    if (cfg && Array.isArray(cfg.conversationRoutes)) {
      // Buscamos la ruta que ofrezca la misión (primer questChanges)
      const route = cfg.conversationRoutes.find(r => r.questChanges?.length)

      if (route) {
        const { questId, nextStep } = route.questChanges[0]
        const def = questDefs[questId]

        if (def) {
          newNpc.setMission({
            id:           def.id,
            type:         def.type,
            title:        def.title,
            description:  def.description,
            steps:        def.steps,
            currentStep:  Math.max(0, nextStep - 1),
            completed:    false,
            rewards:      def.rewards
          })
        }
      }
    }


    allNpcs[newNpc.id_npc] = newNpc
    return newNpc
}

/*
Genera un NPC aleatorio o predefinido
Si se pasa npcId, busca en predefinedNpcs. Sino, crea uno usando npcNames, npcAppearance, etc.
*/
export function generateNpc(roleCategory = null, npcType = null, npcId = null) {
    console.log("npcNames:", npcNames)
    console.log("npcRole:", npcRole)
    console.log("npcChance:", npcChance)
    console.log("npcDialogs:", npcDialogs)
    console.log("npcAppearance:", npcAppearance)
    console.log("predefinedNpcs:", predefinedNpcs)

    if (!npcNames || !npcRole || !npcChance || !npcDialogs || !npcAppearance || !predefinedNpcs) {
        console.error("No se han inicializado los JSON de NPC. Llama a initNpcData primero")

        return null
    }

    if (npcId) {
        // Generar un NPC predefinido (permanente)
        let npc = generatePredefinedNpc(npcId)
        allNpcs[npc.id_npc] = npc
        return npc
    }

    // Para NPC efímeros, se ignoran npcType y se genera todo de forma aleatoria
    let genId = cryptoRandomUUID()

    // Seleccionar género y nombre
    let genderKeys = Object.keys(npcNames)
    let randomGender = genderKeys[Math.floor(Math.random() * genderKeys.length)]

    let nameArray = npcNames[randomGender]
    let randomName = nameArray[Math.floor(Math.random() * nameArray.length)]
    let name = randomName.charAt(0).toUpperCase() + randomName.slice(1)

    // Elección aleatoria (ignorando npcType)
    let determinedCategory = roleCategory ? roleCategory : Object.keys(npcRole)[Math.floor(Math.random() * Object.keys(npcRole).length)]
    let possibleRoles = npcRole[determinedCategory]
    let randRole = possibleRoles[Math.floor(Math.random() * possibleRoles.length)]
    let determinedRole = randRole.charAt(0).toUpperCase() + randRole.slice(1)

    // Días que el NPC permanecerá (-1 = permanente)
    let daysLeftArray = [-1, -1, 2, 3, 4]
    let days_left = daysLeftArray[Math.floor(Math.random() * daysLeftArray.length)]

    // Seleccionar apariencia basada en el rol y género
    let roleKey = determinedRole.toLowerCase()
    let appearanceList = ["un individuo misterioso"]

    if (npcAppearance[roleKey]) {
        let data = npcAppearance[roleKey]

        if (Array.isArray(data)) {
            appearanceList = data

        } else {
            if (data[randomGender]) {
                appearanceList = data[randomGender]

            } else {
                appearanceList = data['neutral'] || ["un individuo misterioso"]

            }
        }
    }

    let randomAppearance = appearanceList[Math.floor(Math.random() * appearanceList.length)]


    const shopChance = 0.3
    const hasShop = Math.random() < shopChance
    let storeItems = []

    if (hasShop && window.storesDatabase && typeof window.storesDatabase === 'object') {
        const storeKeys = Object.keys(window.storesDatabase)
        // Intentamos asignar hasta 3 artículos
        for (let i = 0; i < 3; i++) {
            // Elegir una tienda aleatoria a partir de las claves
            const randomStoreKey = storeKeys[Math.floor(Math.random() * storeKeys.length)]
            const selectedStoreArray = window.storesDatabase[randomStoreKey]
            if (selectedStoreArray && selectedStoreArray.length > 0) {
                // Seleccionar un ítem aleatorio de la tienda seleccionada
                const rIndex = Math.floor(Math.random() * selectedStoreArray.length)
                // Asignar al ítem la cantidad usando la función de asignación
                const assignedItem = assignStoreQuantity([selectedStoreArray[rIndex]])[0]
                storeItems.push(assignedItem)
            }
        }
    }

    let newNpc = new NPC({
        id_npc: genId,
        name: name,
        gender: randomGender,
        role_category: determinedCategory,
        role: determinedRole,
        days_left: days_left,
        appearance: randomAppearance,
        shop: hasShop,
        store: storeItems
    })

    allNpcs[newNpc.id_npc] = newNpc

    return newNpc
}

function assignStoreQuantity(storeItems) {
    if (!storeItems || !Array.isArray(storeItems)) return []

    return storeItems.map(item => {
        if ('min_quantity' in item && 'max_quantity' in item) {
            const quantity = Math.floor(Math.random() * (item.max_quantity - item.min_quantity + 1)) + item.min_quantity
            return { ...item, quantity }
        }

        return item
    })
}

function cryptoRandomUUID() {
	if (crypto && crypto.randomUUID) {
		return crypto.randomUUID()

	} else {
		return 'uuid-' + (Math.random() * 99999999).toFixed(0)
	}
}
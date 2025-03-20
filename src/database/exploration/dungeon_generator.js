import moduleChances from './module_chances.js'
import moduleBio from './module_bio.js'
import moduleSecret from './module_secret.js'
import { showMenu } from '../../../config/menus.js'


// Arrays de imágenes disponibles (no se repetirán)
const availableModuleImages = [
    'module_01.webp', 'module_02.webp', 'module_03.webp',
    'module_04.webp', 'module_05.webp', 'module_06.webp',
    'module_07.webp', 'module_08.webp', 'module_09.webp',
    'module_10.webp'
]
const availableCorridorImages = [
    'corridor_01.webp', 'corridor_02.webp', 'corridor_03.webp', 'corridor_04.webp'
]

function getRandomImage(availableImages, folderPath) {
    if (availableImages.length === 0) {
        if (folderPath.includes('modules')) {
            availableImages.push(
                'module_01.webp', 'module_02.webp', 'module_03.webp',
                'module_04.webp', 'module_05.webp', 'module_06.webp',
                'module_07.webp', 'module_08.webp', 'module_09.webp',
                'module_10.webp'
            )
        } else if (folderPath.includes('corridors')) {
            availableImages.push(
                'corridor_01.webp', 'corridor_02.webp', 'corridor_03.webp', 'corridor_04.webp'
            )
        }
    }
    const index = Math.floor(Math.random() * availableImages.length)
    const image = availableImages[index]
    availableImages.splice(index, 1)
    // Retornamos el nombre original, ej. "module_01.webp"
    return image
}


function getRandomBio(eventType) {
    let category = 'common'
    if (eventType !== 'ninguno') {
        // Asume que en moduleBio existen claves: enemy, trap, event
        category = eventType 
    }
    const lines = moduleBio[category].lines
    return lines[Math.floor(Math.random() * lines.length)]
}




function getRandomSecretHint() {
    const lines = moduleSecret.secret.lines
    return lines[Math.floor(Math.random() * lines.length)]
}



export function generateModule(id, type, isDeadEnd) {
    const chances = moduleChances[type] || {}
    const event = generateProbabilisticEvent(chances)
    // Se usa la ruta actualizada para módulos
    const image = getRandomImage(availableModuleImages, 'assets/backgrounds/modules/')
    const bio = getRandomBio(event)
    const hasSecretEntrance = Math.random() < 0.3
    const secretHint = hasSecretEntrance ? getRandomSecretHint() : ''
    return {
        id: id,
        type: type,
        isDeadEnd: isDeadEnd,
        eventChances: chances,
        event: event,
        image: image,
        bio: bio,
        hasSecretEntrance: hasSecretEntrance,
        secretHint: secretHint
    }
}



export function generateCorridor(fromModule, toModule) {
    const length = getRandomInt(1, 3)
    const parts = []
    const images = []  // Se generan imágenes para cada segmento
    const defaultCorridorProb = { enemigo: 0.52, trampa: 0.08, evento: 0.1 }
    for (let i = 0; i < length; i++) {
        const event = generateProbabilisticEvent(defaultCorridorProb)
        parts.push({
            part: i + 1,
            event: event
        })
        images.push(getRandomImage(availableCorridorImages, 'assets/backgrounds/corridors/'))
    }
    const corridorEvent = parts[0].event
    const bio = getRandomBio(corridorEvent)
    return {
        from: fromModule.id,
        to: toModule.id,
        parts: parts,
        images: images,
        bio: bio
    }
}

// Genera la mazmorra completa con módulos y pasillos.
export function generateDungeon(charLevel, zone) {
    const modules = []
    const corridors = []
    let moduleId = 1

    // Aumentamos la cadena principal a 10 para recorrerla de principio a fin
    const mainChainLength = 10
    const initialModule = generateModule(moduleId, 'Habitacion', false)

    modules.push(initialModule)

    let previousModule = initialModule

    moduleId++


    for (let i = 1; i < mainChainLength; i++) {
        const type = (i % 2 === 0) ? 'Sala de cruces' : 'Habitacion'
        const newModule = generateModule(moduleId, type, false)

        modules.push(newModule)

        const corridor = generateCorridor(previousModule, newModule)
        corridors.push(corridor)
        previousModule = newModule

        moduleId++
    }

    const branchCount = 2

    for (let i = 0; i < branchCount; i++) {
        const fromIndex = getRandomInt(0, modules.length - 2)
        const branchOrigin = modules[fromIndex]
        const branchModule = generateModule(moduleId, 'Habitacion', false)

        modules.push(branchModule)

        const branchCorridor = generateCorridor(branchOrigin, branchModule)

        corridors.push(branchCorridor)

        moduleId++
    }


    const deadEndCount = 3
    for (let i = 0; i < deadEndCount; i++) {
        const fromIndex = getRandomInt(0, modules.length - 1)
        const deadEndOrigin = modules[fromIndex]
        const deadEndModule = generateModule(moduleId, 'Habitacion', true)

        modules.push(deadEndModule)

        const deadEndCorridor = generateCorridor(deadEndOrigin, deadEndModule)

        corridors.push(deadEndCorridor)

        moduleId++
    }

    return {
        modules: modules,
        corridors: corridors,
        charLevel: charLevel,
        zone: zone
    }
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


function generateProbabilisticEvent(probabilities) {
    let totalProb = 0

    for (let key in probabilities) {
        totalProb += probabilities[key]

    }

    const noEventProb = 1 - totalProb
    const r = Math.random()

    if (r < noEventProb) {
        return 'ninguno'

    }

    let cumulative = noEventProb

    for (let key in probabilities) {
        cumulative += probabilities[key]

        if (r < cumulative) {
            return key

        }
    }


    return 'ninguno'
}


export { availableModuleImages, availableCorridorImages }
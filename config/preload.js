import { Player } from '../src/character/player.js'
import { availableModuleImages, availableCorridorImages } from '../src/database/exploration/dungeon_generator.js'

export function preload_textBox(scene) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'assets/textbox.css'

    document.head.appendChild(link)
    

    console.log('TextBox cargada')
    
}


export function preload_styleMenu(scene) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'assets/menus.css'

    document.head.appendChild(link)
    

    console.log('TextBox cargada')

}



export function preload_bgScenario(scene) {
    scene.load.image('black', 'assets/backgrounds/black.png')

    scene.load.image('forest', 'assets/backgrounds/forest.png')
    scene.load.image('market', 'assets/backgrounds/market.png')
    scene.load.image('main_door', 'assets/backgrounds/main_door.png')

    scene.load.image('inn', 'assets/backgrounds/inn.png')
    scene.load.image('library', 'assets/backgrounds/library.png')
    scene.load.image('blacksmith', 'assets/backgrounds/blacksmith.png')
    scene.load.image('plaza', 'assets/backgrounds/plaza.png')
    scene.load.image('taylor', 'assets/backgrounds/taylor.png')
    scene.load.image('town', 'assets/backgrounds/town.png')
    scene.load.image('narrow', 'assets/backgrounds/narrow.png')


    console.log('✅ Imágenes VnScene cargadas')
    
}



export function preload_IntroScene(scene) {
    scene.load.image('black', 'assets/backgrounds/black.png')

    scene.load.image('nforest', 'assets/backgrounds/northaven_forest.webp')
    scene.load.image('dungate', 'assets/backgrounds/dungeon_gate.webp')
    scene.load.image('goddess', 'assets/backgrounds/goddess.webp')
    scene.load.image('treasure', 'assets/backgrounds/treasure.webp')
    scene.load.image('battle', 'assets/backgrounds/battle.webp')

    console.log("✅ Imágenes IntroScene cargadas")

}



export function preload_charStats(scene) {

    scene.load.json('weapon_db', 'src/database/items/gear/db/weapon_db.json')
    scene.load.json('shield_db', 'src/database/items/gear/db/shield_db.json')
    scene.load.json('armor_db', 'src/database/items/gear/db/armor_db.json')
    scene.load.json('accessory_db', 'src/database/items/gear/db/accessory_db.json')

    console.log("✅ Base de datos cargada:", scene.jobStats, scene.weaponDb, scene.shieldDb, scene.armorDb, scene.accessoryDb)

}


export function preload_dungeon(scene) {
    // Carga de imágenes de módulos
    availableModuleImages.forEach((filename, index) => {
        scene.load.image('module' + (index + 1), 'assets/backgrounds/modules/' + filename)

    })

    // Carga de imágenes de pasillos
    availableCorridorImages.forEach((filename, index) => {
        scene.load.image('corridor' + (index + 1), 'assets/backgrounds/corridors/' + filename)

    })
}
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

export function preload_idle_characters(scene) {
    /*
    scene.load.image('_idle', 'assets/characters/idle/_idle.webp')

    scene.load.image('barbarian_idle', 'assets/characters/idle/barbarian_idle.webp')
    scene.load.image('wizard_idle', 'assets/characters/idle/wizard_idle.webp')
    scene.load.image('archer_idle', 'assets/characters/idle/archer_idle.webp')

    scene.load.image('ranger_idle', 'assets/characters/idle/ranger_idle.webp')
    scene.load.image('bard_idle', 'assets/characters/idle/bard_idle.webp')
    scene.load.image('slayer_idle', 'assets/characters/idle/slayer_idle.webp')
    */
}

export function preload_enemies_forest(scene) {
    scene.load.json('monster_db', 'src/database/enemy/monster_db.json')
    
    /*
    scene.load.image('null', 'assets/enemies/null.webp')
    
    scene.load.image('skeleton', 'assets/enemies/skeleton.webp')
    scene.load.image('raggedzombie', 'assets/enemies/raggedzombie.webp')
    scene.load.image('mummy', 'assets/enemies/mummy.webp')
    scene.load.image('wolf', 'assets/enemies/wolf.webp')

    scene.load.image('slime', 'assets/enemies/slime.webp')
    scene.load.image('poisonousslime', 'assets/enemies/poisonousslime.webp')
    */

    scene.allowedEnemyKeys = ['skeleton', 'slime', 'poisonous_slime', 'wolf', 'ragged_zombie', 'mummy']
    
}
export function preload_enemies_cave(scene) {
    scene.load.json('monster_db', 'src/database/enemy/monster_db.json')
    
    /*

    scene.load.image('null', 'assets/enemies/null.webp')

    scene.load.image('barpy', 'assets/enemies/barpy.webp')
    scene.load.image('wolf', 'assets/enemies/wolf.webp')
    
    scene.load.image('icewolf', 'assets/enemies/icewolf.webp')
    scene.load.image('kobold', 'assets/enemies/kobold.webp')
    scene.load.image('draco', 'assets/enemies/draco.webp')
    */
   
    scene.allowedEnemyKeys = ['barpy', 'wolf', 'icewolf', 'kobold', 'draco']
}
export function preload_enemies_crypt(scene) {
    scene.load.json('monster_db', 'src/database/enemy/monster_db.json')

    /*
    scene.load.image('null', 'assets/enemies/null.webp')

    scene.load.image('skeleton', 'assets/enemies/skeleton.webp')
    scene.load.image('eliteskeleton', 'assets/enemies/eliteskeleton.webp')
    scene.load.image('nightmareskeleton', 'assets/enemies/nightmareskeleton.webp')
    
    scene.load.image('wolf', 'assets/enemies/wolf.webp')
    scene.load.image('mummy', 'assets/enemies/mummy.webp')
    scene.load.image('raggedzombie', 'assets/enemies/raggedzombie.webp')
    scene.load.image('gargoyle', 'assets/enemies/gargoyle.webp')
    
    scene.load.image('slime', 'assets/enemies/slime.webp')
    scene.load.image('poisonousslime', 'assets/enemies/poisonousslime.webp')
    
    scene.load.image('aristh', 'assets/enemies/aristh.webp')
    */
    scene.allowedEnemyKeys = ['skeleton', 'elite_skeleton', 'nightmare_skeleton', 'wolf', 'mummy', 'ragged_zombie', 'gargoyle', 'slime', 'poisonous_slime']

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
    scene.load.image('blacksmith-loft', 'assets/backgrounds/blacksmith-loft.png')

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
    console.log("preload_charStats: Starting to load JSON files")
    scene.load.json('weapon_db', 'src/database/items/gear/db/weapon_db.json')
    scene.load.json('shield_db', 'src/database/items/gear/db/shield_db.json')
    scene.load.json('armor_db', 'src/database/items/gear/db/armor_db.json')
    scene.load.json('accessory_db', 'src/database/items/gear/db/accessory_db.json')

    scene.load.on('loaderror', (file) => {
        console.error("preload_charStats: Error loading", file.key)
    })

    scene.load.once('complete', () => {
        console.log("preload_charStats: Database loaded:")
        console.log("weapon_db:", JSON.stringify(scene.cache.json.get('weapon_db')))
        console.log("shield_db:", JSON.stringify(scene.cache.json.get('shield_db')))
        console.log("armor_db:", JSON.stringify(scene.cache.json.get('armor_db')))
        console.log("accessory_db:", JSON.stringify(scene.cache.json.get('accessory_db')))
    })
}


export function preload_dungeon(scene) {
    availableModuleImages.forEach(image => {
        console.log("Cargando asset:", image, "ruta:", `assets/backgrounds/modules/${image}`)
        scene.load.image(image, `assets/backgrounds/modules/${image}`)
    })
    availableCorridorImages.forEach(image => {
        console.log("Cargando asset:", image, "ruta:", `assets/backgrounds/corridors/${image}`)
        scene.load.image(image, `assets/backgrounds/corridors/${image}`)
    })
}
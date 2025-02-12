import CONFIG from "../config/config.js"
import { Player } from '../src/character/player.js'
import { showDialog, resize_bg } from "../config/dialogs_config.js"
import { preload_bgScenario, preload_IntroScene, preload_textBox, preload_charStats } from "../config/preload.js"
//import { create_textBox, create_dialogContainer } from "../config/create.js"
import { job_stats } from "../src/character/player_db.js"

export class IntroScene extends Phaser.Scene {

    constructor() {
        super('IntroScene') // Nombre de la escena

    }


    preload() {

        // Carga los archivos db para crear el personaje
        preload_charStats(this)

        // Carga el archivo JSON de diálogos
        this.load.json('dialogs', '/src/database/dialogs/intro_dialogs.json')


        preload_IntroScene(this)

        preload_bgScenario(this)

        preload_textBox(this)

    }


    create() {
        console.log("✅ Ejecutando IntroScene.create()")

        preload_charStats(this)

        // Obtener los datos JSON
        this.jobStats =         this.cache.json.get('job_stats')
        this.weaponDb =         this.cache.json.get('weapon_db')
        this.shieldDb =         this.cache.json.get('shield_db')
        this.armorDb =          this.cache.json.get('armor_db')
        this.accessoryDb =      this.cache.json.get('accessory_db')

        if (!this.jobStats)     console.error("❌ Error: No se pudo cargar jobStats")
        if (!this.weaponDb)     console.error("❌ Error: No se pudo cargar weaponDb")
        if (!this.shieldDb)     console.error("❌ Error: No se pudo cargar shieldDb")
        if (!this.armorDb)      console.error("❌ Error: No se pudo cargar armorDb")
        if (!this.accessoryDb)  console.error("❌ Error: No se pudo cargar accessoryDb")
    
    
        console.log("☑️ Base de datos cargada:", this.jobStats, this.weaponDb, this.shieldDb, this.armorDb, this.accessoryDb)


        this.playerData = this.scene.settings.data?.player ?? { name: "Jugador", job: "barbarian" }
        this.jobData = this.jobStats?.[this.playerData.job] ?? this.jobStats?.["barbarian"]
        this.player = new Player(
            this.playerData.name,
            this.playerData.job,
            this.playerData.level,
            this.playerData.fatigue,
            this.weaponDb,
            this.shieldDb,
            this.armorDb,
            this.accessoryDb
        )

        this.dialogs = this.cache.json.get('dialogs')
        this.currentIndex = 0
    
        if (!this.dialogs) {
            console.error("❌ No se han cargado diálogos. Verifica la ruta del JSON.")


            return
        }
    
        this.bg = this.add.image(640, 360, 'black').setOrigin(0.5, 0.5)
    
        if (this.bg) {
            console.log("📏 Llamando a resize_bg() después de la creación de this.bg")
            resize_bg(this)

        } else {
            console.error("❌ this.bg no se ha creado correctamente antes de llamar a resize_bg()")
            
        }
    
        // ✅ Usar función de flecha para evitar problemas con `this`
        this.scale.on('resize', () => resize_bg(this)) 
    
        this.textboxText = document.createElement('div')
        this.textboxText.className = 'textbox'
        this.textboxText.style.fontFamily = CONFIG.TEXT.FONT
        this.textboxText.style.fontSize = CONFIG.TEXT.SIZE
        this.textboxText.style.color = CONFIG.TEXT.COLOR
        this.textboxText.style.width = "95%"
        this.textboxText.style.maxWidth = "1600px"
        this.textboxText.style.height = "160px"
        this.textboxText.style.overflow = "hidden" // scroll
        document.body.appendChild(this.textboxText)
        

        //    2) Nombre del speaker
        this.speakerNameBox = document.createElement('div')
        this.speakerNameBox.className = 'speakerNameBox'

        document.body.appendChild(this.speakerNameBox)
    

        //    3) Imagen del NPC
        this.npcImage = document.createElement('img')
        this.npcImage.className = 'npcImage'
        document.body.appendChild(this.npcImage)
        


        this.typingSpeed = CONFIG.TEXT.SPEED
        this.typingMultiplier = CONFIG.TEXT.FAST_MULTIPLIER
    

        this.input.keyboard.on('keydown-ADD', () => {
            this.typingSpeed = Math.max(10, this.typingSpeed - 10)

        })
    
        this.input.keyboard.on('keydown-SUBTRACT', () => {
            this.typingSpeed = Math.min(200, this.typingSpeed + 10)

        })


    
        console.log("📢 Llamando showDialog()...")
        showDialog(this) 
    }



}
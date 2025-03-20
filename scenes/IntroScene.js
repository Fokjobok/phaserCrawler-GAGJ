import CONFIG from "../config/config.js"
import { Player } from '../src/character/player.js'
import { showDialog, resize_bg } from "../config/dialogs.js"
import { preload_bgScenario, preload_IntroScene, preload_textBox, preload_charStats } from "../config/preload.js"
import { job_stats } from "../src/character/player_db.js"

export class IntroScene extends Phaser.Scene {

    constructor() {
        super('IntroScene')
    }

    preload() {
        // Cargar los assets necesarios
        preload_charStats(this)
        this.load.json('dialogs', 'src/database/dialogs/intro_dialogs.json')
        preload_IntroScene(this)
        preload_bgScenario(this)
        preload_textBox(this)
    }

    create() {
        console.log("IntroScene: Creación")
        // Se asume que el objeto Player ya fue creado en SelectClassScene
        if (this.scene.settings.data && this.scene.settings.data.player) {
            this.player = this.scene.settings.data.player
            console.log("IntroScene: Usando el player recibido", this.player.toString())
        }
        else {
            console.error("IntroScene: No se recibió un player. La creación del personaje debe hacerse en SelectClassScene.")
            return
        }

        // Cargar diálogos
        this.dialogs = this.cache.json.get('dialogs')
        this.currentIndex = 0
        if (!this.dialogs) {
            console.error("Error: Dialogues no cargados. Verifica la ruta JSON.")
            return
        }
        console.log("IntroScene: Dialogues cargados", this.dialogs)

        // Crear imagen de fondo
        this.bg = this.add.image(640, 360, 'black').setOrigin(0.5, 0.5)
        if (this.bg) {
            console.log("IntroScene: Background image creada")
            resize_bg(this)
        }
        else {
            console.error("Error: Background image 'black' no creada")
        }

        this.scale.on('resize', () => {
            console.log("IntroScene: Redimensionando Background image")
            resize_bg(this)
        })

        // Crear elementos DOM para diálogos
        this.textboxText = document.createElement('div')
        this.textboxText.className = 'textbox'
        this.textboxText.style.fontFamily = CONFIG.TEXT.FONT
        this.textboxText.style.fontSize = CONFIG.TEXT.SIZE
        this.textboxText.style.color = CONFIG.TEXT.COLOR
        this.textboxText.style.width = "95%"
        this.textboxText.style.maxWidth = "1600px"
        this.textboxText.style.height = "160px"
        this.textboxText.style.overflow = "hidden"
        document.body.appendChild(this.textboxText)
        console.log("IntroScene: Textbox created")

        // Speaker name box
        this.speakerNameBox = document.createElement('div')
        this.speakerNameBox.className = 'speakerNameBox'
        document.body.appendChild(this.speakerNameBox)
        console.log("IntroScene: SpeakerNameBox creada.")

        // NPC image element
        this.npcImage = document.createElement('img')
        this.npcImage.className = 'npcImage'
        document.body.appendChild(this.npcImage)
        console.log("IntroScene: NPC image creada.")

        this.typingSpeed = CONFIG.TEXT.SPEED
        this.typingMultiplier = CONFIG.TEXT.FAST_MULTIPLIER

        this.input.keyboard.on('keydown-ADD', () => {
            this.typingSpeed = Math.max(10, this.typingSpeed - 10)
            console.log("IntroScene: Velocidad de tipeo disminuida.", this.typingSpeed)
        })

        this.input.keyboard.on('keydown-SUBTRACT', () => {
            this.typingSpeed = Math.min(200, this.typingSpeed + 10)
            console.log("IntroScene: Velocidad de tipeo aumentada.", this.typingSpeed)
        })

        console.log("IntroScene: Before calling showDialog")
        showDialog(this, () => {
            console.log("IntroScene: Transicionando a VnScene")
            this.scene.start('VnScene', { player: this.player })
        })
        console.log("IntroScene: Llamada a showDialog")
    }
}
import CONFIG from '../config/config.js'
import { preload_charStats } from '../config/preload.js'
import { job_stats } from '../src/character/player_db.js'
import { skill_db } from '../src/character/skills/skills_db.js'
import { Player } from '../src/character/player.js'

function rgbToHex(rgbArray) {
    return '#' + rgbArray.map(component => {
        let hex = component.toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }).join('')
}

function rgbToRGBA(rgbArray, alpha = 0.5) {
    return `rgba(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]}, ${alpha})`
}

function formatStat(value) {
    return value < 10 ? "\u00A0" + value : value
}

export class SelectClassScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectClassScene' })
    }

    preload() {
        // Cargar los JSON de equipamiento para que estén disponibles al crear el jugador
        this.load.json('weapon_db', 'src/database/items/gear/db/weapon_db.json')
        this.load.json('shield_db', 'src/database/items/gear/db/shield_db.json')
        this.load.json('armor_db', 'src/database/items/gear/db/armor_db.json')
        this.load.json('accessory_db', 'src/database/items/gear/db/accessory_db.json')
        // Se asume que los demás assets (imágenes, etc.) ya se cargaron en otra escena (BootScene, por ejemplo)
    }

    create() {
        this.playerName = this.scene.settings.data?.playerName || "1234"
        // Variables de la escena
        this.classKeys = Object.keys(job_stats)
        this.jobStats = job_stats
        this.cardsPerPage = 3
        this.totalPages = Math.ceil(this.classKeys.length / this.cardsPerPage)
        this.currentPage = 0    // Página de tarjetas
        this.selectedIndex = 0  // Tarjeta seleccionada
        this.cards = []         // Almacenar las tarjetas

        // Configurar teclas de control
        this.cursors = this.input.keyboard.createCursorKeys()
        this.confirmKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
        this.input.keyboard.on('keydown', this.handleInput, this)

        this.renderPage()
    }

    handleInput(event) {
        switch (event.code) {
            case 'ArrowLeft':
                if (this.selectedIndex > 0) {
                    this.selectedIndex--
                    console.log(`Columna: ${this.selectedIndex}`)
                    this.updateSelection()
                }
                break

            case 'ArrowRight':
                if (this.selectedIndex < this.cardsPerPage - 1 && this.selectedIndex < this.getCurrentPageClasses().length - 1) {
                    this.selectedIndex++
                    console.log(`Columna: ${this.selectedIndex}`)
                    this.updateSelection()
                }
                break

            case 'ArrowUp':
                if (this.currentPage > 0) {
                    this.currentPage--
                    this.renderPage()
                }
                break

            case 'ArrowDown':
                if (this.currentPage < this.totalPages - 1) {
                    this.currentPage++
                    this.renderPage()
                }
                break

            case 'KeyZ':
                let selectedClassKey = this.getCurrentPageClasses()[this.selectedIndex]
                let selectedClassData = this.jobStats[selectedClassKey]

                console.log('Clase seleccionada:', selectedClassKey)
                console.log('Clase seleccionada:', selectedClassData)

                // Recuperar desde el caché los JSON de equipamiento
                let weaponDb = this.cache.json.get('weapon_db')
                let shieldDb = this.cache.json.get('shield_db')
                let armorDb = this.cache.json.get('armor_db')
                let accessoryDb = this.cache.json.get('accessory_db')

                // Crear el objeto Player con todos los datos (la creación se hace aquí)
                let player = new Player(
                    this.playerName,
                    selectedClassKey,
                    1,      // nivel por defecto
                    5,      // fatiga por defecto
                    5,
                    weaponDb,
                    shieldDb,
                    armorDb,
                    accessoryDb
                )


                console.log("SelectClassScene: Nuevo player creado", player.toString())


                // Transición a IntroScene pasando el objeto Player
                this.scene.start('VnScene', { player: player })
                break
        }
    }

    getCurrentPageClasses() {
        let start = this.currentPage * this.cardsPerPage
        let end = start + this.cardsPerPage
        console.log(`getCurrentPageClasses: ${this.classKeys.slice(start, end)}`)
        return this.classKeys.slice(start, end)
    }

    renderPage() {
        // Destruir tarjetas previas (elementos DOM)
        this.cards.forEach(card => card.destroy())
        this.cards = []

        let currentClasses = this.getCurrentPageClasses()
        let cardWidth = 550
        let cardHeight = 550

        let spacing = 40

        let totalWidth = currentClasses.length * cardWidth + (currentClasses.length - 1) * spacing
        let startX = (this.cameras.main.width - totalWidth) / 2
        let centerY = this.cameras.main.height / 2

        currentClasses.forEach((classKey, index) => {
            let job = this.jobStats[classKey]

            let colorArray = CONFIG.COLOR_MAP[job.color]
            let subColorArray = CONFIG.COLOR_MAP[job.color + "_pastel"]

            let cardColor = colorArray ? rgbToHex(colorArray) : job.color
            let subColor = subColorArray ? rgbToRGBA(subColorArray, 0.6) : "rgba(192, 192, 192, 0.6)"

            let title = classKey.charAt(0).toUpperCase() + classKey.slice(1)
            let stats = job.stats
            let statsStr = `
                <div class="card-stats-grid">
                    <span class="stat">STR:${formatStat(stats.str)}</span>
                    <span class="stat">VIT:${formatStat(stats.vit)}</span>
                    <span class="stat">AGI:${formatStat(stats.agi)}</span>
                    <span class="stat">DEX:${formatStat(stats.dex)}</span>
                    <span class="stat">WIS:${formatStat(stats.wis)}</span>
                    <span class="stat">SOU:${formatStat(stats.sou)}</span>
                </div>`
            let skillId = job.default_skills[0] || ''
            let skillName = skill_db[skillId] ? skill_db[skillId].name : ''

            let cardHTML = `
            <div class="card" style="border-color: ${cardColor};">
                <div class="card-bg" style="background-image: url('assets/characters/${job.job_image}.webp'); border-radius: 6px;"></div>
                <div class="card-overlay" style="background-color: ${subColor};"></div>
                <div class="card-content">
                    <h2 class="card-title" style="color: ${cardColor};">${title}</h2>
                    <div class="card-body">
                        <p class="card-skill">\n${skillName}</p>
                        <p class="card-description">${job.description.class}</p>
                        <div class="stats-box">${statsStr}</div>
                    </div>
                </div>
            </div>`

            let posX = startX + index * (cardWidth + spacing) + cardWidth / 2
            let posY = centerY
            
            let container = this.add.dom(posX, posY).createFromHTML(cardHTML)
            let cardElement = container.node.querySelector('.card')
            if (cardElement) {
                cardElement.setAttribute('data-card-color', cardColor)
            }
            container.node.classList.add('card-container')
            container.node.dataset.cardColor = cardColor
            this.cards.push(container)
        })

        this.updateSelection()
    }

    updateSelection() {
        this.cards.forEach((card, index) => {
            const cardElement = card.node.querySelector('.card')
            if (!cardElement) return
            if (index === this.selectedIndex) {
                cardElement.classList.add('selected')
                const neonColor = cardElement.getAttribute('data-card-color') || '#f0f'
                cardElement.style.setProperty('--neon-color', neonColor)
                cardElement.style.setProperty('border-color', 'black')
            }
            else {
                cardElement.classList.remove('selected')
                const originalColor = cardElement.getAttribute('data-card-color') || '#f0f'
                cardElement.style.setProperty('border-color', originalColor)
                cardElement.style.removeProperty('--neon-color')
            }
        })
    }

    update() {
        
    }
}
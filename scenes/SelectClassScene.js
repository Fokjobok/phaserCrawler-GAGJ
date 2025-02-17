import CONFIG from '../config/config.js'
import { job_stats } from '../src/character/player_db.js'
import { skill_db } from '../src/character/skills/skills_db.js'
import { Player } from '../src/character/player.js'



function rgbToHex(rgbArray) {
    return '#' + rgbArray.map(component => {
        let hex = component.toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }).join('')
}

function rgbToRGBA(rgbArray, alpha = 0.5) {  // Alpha controla la transparencia
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
        
    }

    create() {
        this.playerName = this.scene.settings.data?.playerName || "Antonio"
        // Variables de la escena
        this.classKeys = Object.keys(job_stats)
        this.jobStats = job_stats
        this.cardsPerPage = 3
        this.totalPages = Math.ceil(this.classKeys.length / this.cardsPerPage)

        this.currentPage = 0    // página de tarjetas
        this.selectedIndex = 0  // tarjeta seleccionada

        this.cards = []  // Array para almacenar las tarjetas (elementos DOM)


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
                    this.selectedIndex = this.selectedIndex

                    console.log(`Fila: ${this.currentPage}`)


                    this.renderPage()
                }
                break


            case 'ArrowDown':
                if (this.currentPage < this.totalPages - 1) {
                    this.currentPage++
                    this.selectedIndex = this.selectedIndex

                    console.log(`Fila: ${this.currentPage}`)


                    this.renderPage()
                }
                break


            case 'KeyZ':

                console.log(this.getCurrentPageClasses())
                let selectedClassKey = this.getCurrentPageClasses()[this.selectedIndex]

                let remainingClasses = this.classKeys.filter(job => job !== selectedClassKey)
                let selectedClassKey2 = remainingClasses[Math.floor(Math.random() * remainingClasses.length)]
                remainingClasses = remainingClasses.filter(job => job !== selectedClassKey2)
                let selectedClassKey3 = remainingClasses[Math.floor(Math.random() * remainingClasses.length)]


                let selectedClassData = this.jobStats[selectedClassKey]
                let selectedClassData2 = this.jobStats[selectedClassKey2]
                let selectedClassData3 = this.jobStats[selectedClassKey3]

                console.log('Clase seleccionada:', selectedClassKey)
                console.log('Clase seleccionada:', selectedClassData)

                console.log('Clase seleccionada:', selectedClassKey2)
                console.log('Clase seleccionada:', selectedClassData2)

                console.log('Clase seleccionada:', selectedClassKey3)
                console.log('Clase seleccionada:', selectedClassData3)
                

                // Crear el objeto Player (asumiendo que el constructor de Player espera (name, job))
                let player = new Player(this.playerName, selectedClassKey)
                let player2 = new Player(this.playerName, selectedClassKey2)
                let player3 = new Player(this.playerName, selectedClassKey3)



                // Transición a IntroScene pasando el objeto Player
                this.scene.start('VnScene', { player: player, player2, player3 })


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

            // Aquí se calculan posX, posY, cardColor, subColor, etc.
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
            //let skillDef = skill_db[skillId] ? skill_db[skillId].desc : ''


            let cardHTML = `
            <div class="card" style="border-color: ${cardColor};">
                <div class="card-bg" style="background-image: url('assets/characters/${job.job_image}.webp'); border-radius: 6px;"></div>
                <div class="card-overlay" style="background-color: ${subColor};"></div>
                <div class="card-content">
                <h2 class="card-title" style="color: ${cardColor};">${title}</h2>
                <div class="card-body">
                    <p class="card-skill" >\n${skillName}</p>

                    <p class="card-description">${job.description.class}</p>
                    <div class="stats-box">${statsStr}</div>
                    </div>
                </div>
            </div>`
            

            // Posicionar: en Phaser los elementos DOM se posicionan según su centro
            let posX = startX + index * (cardWidth + spacing) + cardWidth / 2
            let posY = centerY


            // Aquí se calculan posX, posY, cardColor, subColor, etc.
            let domElement = this.add.dom(posX, posY).createFromHTML(cardHTML)


            // Obtiene elem de la clase .card y asigna atrib data‑card‑color
            let cardElement = domElement.node.querySelector('.card')

            if (cardElement) {
                cardElement.setAttribute('data-card-color', cardColor)
                //console.log("Color de tarjeta:", cardElement.getAttribute('data-card-color'))

            }
            

            domElement.node.classList.add('card-container')
            domElement.node.dataset.cardColor = cardColor

            domElement.node.classList.add('card-container')
            domElement.node.setAttribute('data-card-color', cardColor)

            console.log("Color asignado a la tarjeta:", domElement.node.dataset.cardColor)


            // Asignar clase para selección
            domElement.node.classList.add('card-container')


            this.cards.push(domElement)

        })


        this.updateSelection()
    }

    updateSelection() {
        this.cards.forEach((card, index) => {
            const cardElement = card.node.querySelector('.card')

            if (!cardElement) return

            if (index === this.selectedIndex) {
                cardElement.classList.add('selected')

                // Recupera el color desde el atributo data‑card‑color
                const neonColor = cardElement.getAttribute('data-card-color') || '#f0f'
                cardElement.style.setProperty('--neon-color', neonColor)
                cardElement.style.setProperty('border-color', 'black')

            } else {
                cardElement.classList.remove('selected')

                // Restaura el borde original usando el valor almacenado
                const originalColor = cardElement.getAttribute('data-card-color') || '#f0f'

                cardElement.style.setProperty('border-color', originalColor)
                cardElement.style.removeProperty('--neon-color')
            }
        })
    }

    
    update() {
        
    }
}
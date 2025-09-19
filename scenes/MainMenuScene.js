import CONFIG from "../config/config.js"

export class MainMenuScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MainMenuScene' })
  }

  preload() {
    // Estilos se cargan por CSS externo
  }

  create() {
    // Cargar CSS dedicado si no está presente
    if (!document.getElementById('css-main-menu')) {
      const link = document.createElement('link')
      link.id = 'css-main-menu'
      link.rel = 'stylesheet'
      link.href = 'assets/scenes/MainMenuScene.css'
      document.head.appendChild(link)
    }

    const html = `
      <div class="main-menu-root">
        <div class="main-menu-bg-gradient"></div>
        <div class="main-menu-bg-image"></div>
        <div class="main-menu-bg-vignette"></div>

        <div class="main-menu-title-wrap">
          <div class="main-menu-title-box">
            <h1 class="main-menu-title">PhaserCrawler</h1>
            <div class="main-menu-subtitle">Una novela visual de fantasía medieval</div>
          </div>
        </div>

        <div class="main-menu-panel">
          <div class="main-menu-buttons">
            <button id="btn-new" class="btn-primary">Comenzar</button>
            <button id="btn-continue" class="btn-secondary">Continuar</button>
            <button id="btn-options" class="btn-ghost">Opciones</button>
            <button id="btn-credits" class="btn-ghost">Créditos</button>
          </div>
        </div>

        <div class="main-menu-footer">© Oseibalamaner Studio · v0.1</div>
      </div>`

    const container = this.add.dom(0, 0).createFromHTML(html).setOrigin(0, 0)

    const hasSave = !!window.localStorage.getItem('save_slot_1')
    const cont = container.node
    const newBtn = cont.querySelector('#btn-new')
    const contBtn = cont.querySelector('#btn-continue')
    const optBtn = cont.querySelector('#btn-options')
    const credBtn = cont.querySelector('#btn-credits')

    if (!hasSave) {
      contBtn.classList.add('btn-disabled')
      contBtn.title = 'No hay partida guardada'
    }

    const startGame = () => {
      this.scene.start('CharacterDataScene')
    }

    newBtn.addEventListener('click', startGame)
    contBtn.addEventListener('click', () => {
      const save = window.localStorage.getItem('save_slot_1')
      if (save) {
        try {
          const data = JSON.parse(save)
          this.scene.start('VnScene', data)
        } catch {
          alert('Guardado corrupto. Inicia una nueva partida.')
        }
      }
    })
    optBtn.addEventListener('click', () => {
      alert('Opciones próximamente: volumen, idioma, accesibilidad...')
    })
    credBtn.addEventListener('click', () => {
      alert('Créditos\nDirección: T·\nArte: Recursos CC0\nMúsica: próximamente')
    })
  }
}


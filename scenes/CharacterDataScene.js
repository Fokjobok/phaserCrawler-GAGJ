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

function rgbToRGBA(rgbArray, alpha = 0.5) {
  return `rgba(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]}, ${alpha})`
}

function formatStat(value) {
  return value < 10 ? "\u00A0" + value : value
}

export class CharacterDataScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterDataScene' })
  }

  preload() {
    // JSON de equipamiento para crear el jugador
    this.load.json('weapon_db', 'src/database/items/gear/db/weapon_db.json')
    this.load.json('shield_db', 'src/database/items/gear/db/shield_db.json')
    this.load.json('armor_db', 'src/database/items/gear/db/armor_db.json')
    this.load.json('accessory_db', 'src/database/items/gear/db/accessory_db.json')
  }

  create() {
    // Cargar CSS necesarios (tarjetas + layout de esta escena)
    if (!document.getElementById('css-select-class-shared')) {
      const link = document.createElement('link')
      link.id = 'css-select-class-shared'
      link.rel = 'stylesheet'
      link.href = 'assets/scenes/SelectClassScene.css'
      document.head.appendChild(link)
    }
    if (!document.getElementById('css-character-data')) {
      const link = document.createElement('link')
      link.id = 'css-character-data'
      link.rel = 'stylesheet'
      link.href = 'assets/scenes/CharacterDataScene.css'
      document.head.appendChild(link)
    }

    this.classKeys = Object.keys(job_stats)
    this.selectedClass = this.classKeys[0] || 'warrior'

    const rootHTML = `
      <div class="char-data-root">
        <div class="char-left">
          <h2 class="char-form-title">Datos del personaje</h2>
          <form id="charForm" class="char-form">
            <div class="form-row">
              <label for="name">Nombre</label>
              <input id="name" name="name" type="text" maxlength="20" placeholder="Introduce tu nombre" value="Antonio" required />
            </div>
            <div class="form-row">
              <label for="age">Edad</label>
              <input id="age" name="age" type="number" min="16" max="240" value="24" />
            </div>
            <div class="form-row">
              <label for="class">Clase</label>
              <select id="class" name="class"></select>
            </div>
            <div class="form-row">
              <label for="alignment">Alineación</label>
              <select id="alignment" name="alignment">
                <option value="LB">Legal bueno</option>
                <option value="NB">Neutral bueno</option>
                <option value="CB">Caótico bueno</option>
                <option value="LN">Legal neutral</option>
                <option value="NN" selected>Neutral</option>
                <option value="CN">Caótico neutral</option>
                <option value="LM">Legal malvado</option>
                <option value="NM">Neutral malvado</option>
                <option value="CM">Caótico malvado</option>
              </select>
            </div>
            <div class="form-row">
              <label for="faith">Fe</label>
              <select id="faith" name="faith">
                <option value="none" selected>Ninguna</option>
                <option value="light">La Luz</option>
                <option value="nature">La Naturaleza</option>
                <option value="knowledge">El Conocimiento</option>
                <option value="war">La Guerra</option>
              </select>
            </div>
            <div class="form-row">
              <label for="bg1">Trasfondo - Historia</label>
              <textarea id="bg1" name="bg1" rows="3" placeholder="Escribe una breve historia..."></textarea>
            </div>
            <div class="form-row">
              <label for="bg2">Trasfondo - Rasgos</label>
              <textarea id="bg2" name="bg2" rows="3" placeholder="Rasgos, objetivos, miedos..."></textarea>
            </div>
            <div class="form-actions">
              <button type="button" id="btn-cancel" class="btn-ghost">Volver</button>
              <button type="submit" class="btn-primary">Continuar</button>
            </div>
          </form>
        </div>
        <div class="char-right">
          <div id="cardMount"></div>
        </div>
      </div>`

    // Montar directamente dentro del contenedor DOM de Phaser para evitar el wrapper
    const tpl = document.createElement('template')
    tpl.innerHTML = rootHTML.trim()
    const rootEl = tpl.content.firstElementChild
    const domContainer = this.game && this.game.domContainer ? this.game.domContainer : document.body
    // Habilitar interacciones de ratón sobre el contenedor DOM de Phaser
    const prevPointerEvents = domContainer.style.pointerEvents
    domContainer.style.pointerEvents = 'auto'
    domContainer.appendChild(rootEl)

    // Poblar select de clases
    const formEl = rootEl.querySelector('#charForm')
    const classSelect = rootEl.querySelector('#class')
    this.classKeys.forEach(k => {
      const opt = document.createElement('option')
      opt.value = k
      opt.textContent = k.charAt(0).toUpperCase() + k.slice(1)
      classSelect.appendChild(opt)
    })
    classSelect.value = this.selectedClass

    // Render inicial de la tarjeta
    this.mountEl = rootEl.querySelector('#cardMount')
    this.renderCard(this.selectedClass)

    // Eventos
    classSelect.addEventListener('change', (e) => {
      this.selectedClass = e.target.value
      this.renderCard(this.selectedClass)
    })

    rootEl.querySelector('#btn-cancel').addEventListener('click', () => {
      this.scene.start('MainMenuScene')
    })

    // Limpieza del DOM cuando la escena termine
    const cleanup = () => {
      if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl)
      // Restaurar el estado previo de pointer-events del contenedor DOM
      if (domContainer) domContainer.style.pointerEvents = prevPointerEvents || ''
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup)
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup)

    formEl.addEventListener('submit', (e) => {
      e.preventDefault()
      const name = formEl.name.value.trim()
      if (!name) {
        alert('Por favor, introduce un nombre.')
        return
      }

      // Recuperar desde caché los JSON de equipamiento
      const weaponDb = this.cache.json.get('weapon_db')
      const shieldDb = this.cache.json.get('shield_db')
      const armorDb = this.cache.json.get('armor_db')
      const accessoryDb = this.cache.json.get('accessory_db')

      // Crear Player
      const player = new Player(
        name,
        this.selectedClass,
        5,
        5,
        5,
        weaponDb,
        shieldDb,
        armorDb,
        accessoryDb
      )

      // Atributos adicionales de rol
      const age = parseInt(formEl.age.value || '0', 10)
      player.age = isNaN(age) ? null : age
      player.alignment = formEl.alignment.value
      player.faith = formEl.faith.value
      player.background = {
        historia: formEl.bg1.value || '',
        rasgos: formEl.bg2.value || ''
      }

      // Ir a IntroScene con el player
      this.scene.start('IntroScene', { player })
    })
  }

  renderCard(classKey) {
    // Limpiar montaje previo
    this.mountEl.innerHTML = ''

    const job = job_stats[classKey]
    if (!job) return

    const colorArray = CONFIG.COLOR_MAP[job.color]
    const subColorArray = CONFIG.COLOR_MAP[job.color + "_pastel"]
    const cardColor = colorArray ? rgbToHex(colorArray) : job.color
    const subColor = subColorArray ? rgbToRGBA(subColorArray, 0.6) : "rgba(192, 192, 192, 0.6)"

    const title = classKey.charAt(0).toUpperCase() + classKey.slice(1)
    const stats = job.stats
    const statsStr = `
      <div class="card-stats-grid">
        <span class="stat">STR:${formatStat(stats.str)}</span>
        <span class="stat">VIT:${formatStat(stats.vit)}</span>
        <span class="stat">AGI:${formatStat(stats.agi)}</span>
        <span class="stat">DEX:${formatStat(stats.dex)}</span>
        <span class="stat">WIS:${formatStat(stats.wis)}</span>
        <span class="stat">SOU:${formatStat(stats.sou)}</span>
      </div>`

    const skillId = job.default_skills[0] || ''
    const skillName = skill_db[skillId] ? skill_db[skillId].name : ''

    const cardHTML = `
      <div class="card" style="border-color: ${cardColor};">
        <div class="card-bg" style="background-image: url('assets/characters/${job.job_image}.webp'); border-radius: 6px;"></div>
        <div class="card-overlay" style="background-color: ${subColor};"></div>
        <div class="card-content">
          <h2 class="card-title" style="color: ${cardColor};">${title}</h2>
          <div class="card-body">
            <div class="card-middle">
            </div>
            <div class="card-bottom">
              <p class="card-skill">${skillName}</p>
              <p class="card-description">${job.description.class}</p>
              <div class="stats-box">${statsStr}</div>
            </div>
          </div>
        </div>
      </div>`

    const container = document.createElement('div')
    container.className = 'card-container'
    container.innerHTML = cardHTML
    this.mountEl.appendChild(container)
  }
}

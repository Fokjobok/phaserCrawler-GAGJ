export function createHUD(scene) {
  // Contenedor HUD
  const hudContainer = document.createElement('div')
  hudContainer.id = 'hudContainer'
  document.body.appendChild(hudContainer)

  // Miembros del grupo (hasta 3)
  const group = scene.groupMembers || []

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const pct = (val, max) => {
    const m = Number(max) || 0
    if (m <= 0) return 0
    return clamp(Math.round((Number(val) || 0) * 100 / m), 0, 100)
  }

  for (let i = 0; i < 3; i++) {
    const member = group[i]
    const memberBox = document.createElement('div')
    memberBox.className = 'hudMember'

    if (member) {
      const imageUrl = `assets/characters/hud/${member.job}.webp`

      // Imagen
      const imageBox = document.createElement('div')
      imageBox.className = 'hudImage'

      imageBox.style.backgroundImage = `url(${imageUrl})`
      // Cristal de color de clase
      const tint = document.createElement('div')
      tint.className = 'hudImageTint'
      if (typeof member.getColorAsRGBA === 'function') {
          tint.style.backgroundColor = member.getColorAsRGBA(0.85)
      } else {
          tint.style.backgroundColor = 'rgba(0,0,0,0.25)'
      }
      imageBox.appendChild(tint)

      // Info
      const infoBox = document.createElement('div')
      infoBox.className = 'hudInfo'

      // Cabecera con nombre, clase y nivel
      const nameRow = document.createElement('div')
      nameRow.className = 'hudNameRow'
      const nameEl = document.createElement('div')
      nameEl.className = 'hudName'
      nameEl.textContent = member.name || '—'
      const jobEl = document.createElement('div')
      jobEl.className = 'hudJob'
      const jobCapitalized = member.job ? member.job.charAt(0).toUpperCase() + member.job.slice(1) : ''
      jobEl.textContent = jobCapitalized
      const lvlEl = document.createElement('div')
      lvlEl.className = 'hudLvl'
      lvlEl.textContent = `Nv ${member.level || 1}`
      nameRow.appendChild(nameEl)
      nameRow.appendChild(jobEl)
      nameRow.appendChild(lvlEl)

      // Barras PV / PM / EXP
      const bars = document.createElement('div')
      bars.className = 'hudBars'

      const hpMax = member.hp_max || 100
      const hpCur = clamp(member.hp ?? hpMax, 0, hpMax)
      const hpRow = document.createElement('div')
      hpRow.className = 'hudBar'
      const hpFill = document.createElement('div')
      hpFill.className = 'hudBarFill bar-hp'
      hpFill.style.width = pct(hpCur, hpMax) + '%'
      const hpText = document.createElement('div')
      hpText.className = 'hudBarText'
      hpText.textContent = `PV ${hpCur}/${hpMax}`
      hpRow.appendChild(hpFill)
      hpRow.appendChild(hpText)

      const spMax = member.sp_max || 50
      const spCur = clamp(member.sp ?? spMax, 0, spMax)
      const spRow = document.createElement('div')
      spRow.className = 'hudBar'
      const spFill = document.createElement('div')
      spFill.className = 'hudBarFill bar-sp'
      spFill.style.width = pct(spCur, spMax) + '%'
      const spText = document.createElement('div')
      spText.className = 'hudBarText'
      spText.textContent = `PM ${spCur}/${spMax}`
      spRow.appendChild(spFill)
      spRow.appendChild(spText)

      const expCur = Number(member.exp) || 0
      const expMax = Number(member.exp_max) || 100
      const expRow = document.createElement('div')
      expRow.className = 'hudBar'
      const expFill = document.createElement('div')
      expFill.className = 'hudBarFill bar-exp'
      expFill.style.width = pct(expCur, expMax) + '%'
      const expText = document.createElement('div')
      expText.className = 'hudBarText'
      expText.textContent = `EXP ${expCur}/${expMax}`
      expRow.appendChild(expFill)
      expRow.appendChild(expText)

      bars.appendChild(hpRow)
      bars.appendChild(spRow)
      bars.appendChild(expRow)

      infoBox.appendChild(nameRow)
      infoBox.appendChild(bars)

      memberBox.appendChild(imageBox)
      memberBox.appendChild(infoBox)

      // Borde con color de clase
      try {
          if (typeof member.getColorAsHex === 'function') {
              memberBox.style.borderColor = member.getColorAsHex()
          }
      } catch(e) {}

      // Guardar refs para refresco
      memberBox._refs = {
          hpFill, hpText,
          spFill, spText,
          expFill, expText
      }

      // Toggle expandir/contraer
      memberBox.addEventListener('click', () => {
        memberBox.classList.toggle('expanded')
      })

    } else {
      // Slot bloqueado
      const lockOverlay = document.createElement('div')
      lockOverlay.className = 'lockOverlay'
      lockOverlay.textContent = '🔒'
      memberBox.appendChild(lockOverlay)
    }

    hudContainer.appendChild(memberBox)
  }
  // Actualizador de HUD
  const updateHUD = () => {
      const groupNow = scene.groupMembers || []
      const children = hudContainer.children
      for (let i = 0; i < Math.min(children.length, 3); i++) {
          const box = children[i]
          const p = groupNow[i]
          if (!p || !box || !box._refs) continue
          const hpMax = p.hp_max || 100
          const hpCur = clamp(p.hp ?? hpMax, 0, hpMax)
          box._refs.hpFill.style.width = pct(hpCur, hpMax) + '%'
          box._refs.hpText.textContent = `PV ${hpCur}/${hpMax}`

          const spMax = p.sp_max || 50
          const spCur = clamp(p.sp ?? spMax, 0, spMax)
          box._refs.spFill.style.width = pct(spCur, spMax) + '%'
          box._refs.spText.textContent = `PM ${spCur}/${spMax}`

          const expCur = Number(p.exp) || 0
          const expMax = Number(p.exp_max) || 100
          box._refs.expFill.style.width = pct(expCur, expMax) + '%'
          box._refs.expText.textContent = `EXP ${expCur}/${expMax}`
      }
  }
  // Exponer y suscribirse a eventos
  scene.refreshHUD = updateHUD
  if (scene.events && typeof scene.events.on === 'function') {
      scene.events.on('stats:update', updateHUD)
  }
}

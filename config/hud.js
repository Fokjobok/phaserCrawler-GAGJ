export function createHUD(scene) {
    // Crear contenedor HUD
    const hudContainer = document.createElement('div')
    hudContainer.id = 'hudContainer'
    
    document.body.appendChild(hudContainer)
  
    // Obtener miembros del grupo (hasta 3)
    const group = scene.groupMembers || []
    
 

    for (let i = 0; i < 3; i++) {
        const member = group[i]
        const memberBox = document.createElement('div')
        memberBox.className = 'hudMember'
  
        if (member) {
            // Obtener la imagen y colores
            let imageUrl = `assets/characters/hud/${member.job}.png`
            let borderColor = member.getColorAsHex ? member.getColorAsHex() : 'white'
            let bgColor = member.getColorAsRGBA ? member.getColorAsRGBA(0.3) : 'rgba(0, 0, 0, 0.8)'

            // Crear un div interno para el fondo
            const bgOverlay = document.createElement("div")
            bgOverlay.className = "hudOverlay"
            bgOverlay.style.position = "absolute"
            bgOverlay.style.bottom = "0"
            bgOverlay.style.right = "0"
            bgOverlay.style.width = "100%"
            bgOverlay.style.height = "100%"
            bgOverlay.style.backgroundColor = bgColor
            bgOverlay.style.pointerEvents = "none"  // Para que no interfiera con clics


            // Contenedor de imagen
            const imageBox = document.createElement('div')
            imageBox.className = 'hudImage'
            imageBox.style.maxHeight = "200px"
            imageBox.style.maxWidth = "200px"
            imageBox.style.borderWidth = "12px 8px 12px 0px"
            imageBox.style.borderStyle = "solid"
            imageBox.style.borderColor = borderColor
            imageBox.style.backgroundImage = `url(${imageUrl})`
  

            // Contenedor de información
            const infoBox = document.createElement('div')
            infoBox.className = 'hudInfo'
  
            const col1 = document.createElement('div')
            col1.className = 'hudDetailColumn'
            
            const line11 = document.createElement('div')
            line11.textContent = `${member.name}`
            const line12 = document.createElement('div')
            line12.textContent = `${member.job}`
            const line13 = document.createElement('div')
            line13.textContent = `Nv: ${member.level || 1}`

            col1.appendChild(line11)
            col1.appendChild(line12)
            col1.appendChild(line13)



            const col2 = document.createElement('div');
            col2.className = 'hudDetailColumn';
            
            const line21 = document.createElement('div');
            line21.textContent = `PV: ${member.hp || 100}/${member.hp_max || 100}`;
            
            const line22 = document.createElement('div');
            line22.textContent = `PM: ${member.sp || 50}/${member.sp_max || 50}`;
            
            const line23 = document.createElement('div');
            line23.textContent = `EXP: ${member.exp || 0}`;
            
            col2.appendChild(line21);
            col2.appendChild(line22);
            col2.appendChild(line23);
  


            infoBox.appendChild(col1)
            infoBox.appendChild(col2)
  


            // Agregar imagen y caja de info al contenedor del miembro
            memberBox.appendChild(imageBox)
            memberBox.appendChild(infoBox)
  

            // Estilos de color
            memberBox.style.border = `4px solid ${borderColor}`
            memberBox.style.bgColor = bgColor
            memberBox.appendChild(bgOverlay)


            // Evento para expandir detalles
            memberBox.addEventListener('click', () => {
                memberBox.classList.toggle('expanded')
                imageBox.classList.toggle('expanded')
            })
  
        } else {
            // Si no hay miembro, mostrar candado
            const lockOverlay = document.createElement('div')
            lockOverlay.className = 'lockOverlay'
            lockOverlay.textContent = '🔒'
            memberBox.appendChild(lockOverlay)
            memberBox.style.border = '4px solid gray'
        }
  
        hudContainer.appendChild(memberBox)
    }
}
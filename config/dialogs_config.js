import CONFIG from "./config.js"
import { showMenu, showShopMenu, showNPCSubMenu, showPostDialogueMenu } from "../config/menus.js"

/**
 * Asumiendo que ya tienes 'textboxText' en la escena (ej. scene.textboxText).
 * 
 * Ahora agregaremos:
 *   - scene.speakerNameBox (para el nombre del personaje/narrador)
 *   - scene.npcImage (para mostrar imagen en la parte superior de la textbox)
 */

// 1️⃣ Aplica colores a palabras clave
export function applyKeywordColor(text) {
    let coloredText = text

    for (const [keyword, color] of Object.entries(CONFIG.KEYWORDS)) {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi") // Detectar palabra exacta
        coloredText = coloredText.replace(regex, `<span style="color: ${color}">${keyword}</span>`)
    }

    return coloredText
}

// 2️⃣ Efecto de tipeo (letter by letter)
export function startTyping(scene, fullText) {
    console.log("✍️ Iniciando tipeo de texto...")

    if (!fullText) {
        console.error("❌ No hay texto para mostrar.")
        return
    }

    // 🔹 Asegurar que textbox sea visible
    scene.textboxText.style.display = "block"
    console.log("📢 Haciendo visible la caja de texto.")

    // Dividimos en palabras para controlar la paginación
    let words = fullText.split(" ")
    let pages = []
    let currentText = ""

    scene.textboxText.innerHTML = ""

    // 2️⃣ Generar páginas sin cortar etiquetas HTML a la mitad
    for (let word of words) {
        let testText = currentText.length > 0 ? currentText + " " + word : word
        scene.textboxText.innerHTML = testText.trim()

        if (scene.textboxText.scrollHeight > scene.textboxText.clientHeight) {
            // Guardamos la página anterior
            pages.push(currentText.trim())
            console.log(`📜 Página guardada: "${currentText.trim()}"`)
            currentText = word
            scene.textboxText.innerHTML = ""
        } else {
            currentText = testText
        }
    }

    if (currentText.trim() !== "") {
        pages.push(currentText.trim())
    }

    scene.textboxText.innerHTML = ""
    let currentPage = 0

    // 3️⃣ Mostrar cada página con tipeo
    const showCurrentPage = () => {
        scene.turbo = false
        if (currentPage < pages.length) {
            let text = pages[currentPage]
            let index = 0
            let currentTyping = ""

            scene.textboxText.innerHTML = ""
            console.log(`📖 Mostrando página ${currentPage + 1}/${pages.length}: "${text}"`)

            // 4️⃣ Efecto letter by letter
            const typeWriter = () => {
                if (index < text.length) {
                    currentTyping += text.charAt(index)
                    scene.textboxText.innerHTML = applyKeywordColor(currentTyping)
                    index++
                    setTimeout(typeWriter, scene.turbo ? scene.typingSpeed * scene.typingMultiplier : scene.typingSpeed)
                } else {
                    console.log("✅ Texto completado, esperando Z...")
                    // Espera la tecla Z para pasar de página
                    scene.input.keyboard.once('keydown-Z', () => {
                        currentPage++
                        if (currentPage < pages.length) {
                            showCurrentPage()
                        } else {
                            // Cuando no hay más páginas, cerramos textbox y pasamos al siguiente diálogo
                            scene.textboxText.style.display = "none"
                            scene.speakerNameBox.style.display = "none"
                            scene.npcImage.style.display = "none"
                            scene.currentIndex++
                            if (scene.currentIndex >= scene.dialogs.length) {
                                // Todos los diálogos han sido mostrados: se invoca el menú post-diálogo.
                                showPostDialogueMenu(scene)
                            } else {
                                showDialog(scene)
                            }  // ← Llamamos a showDialog para el siguiente
                        }
                    })
                }
            }

            typeWriter()

            // 5️⃣ Activar "turbo" con la misma tecla Z
            scene.input.keyboard.once('keydown-Z', () => {
                scene.turbo = true
            })
        }
    }

    showCurrentPage()
}


// 3️⃣ Mostramos el diálogo actual y manejamos fondo e imagen
export function showDialog(scene) {
    console.log("✅ Ejecutando showDialog()")
    const dialog = scene.dialogs[scene.currentIndex]
    if (!dialog) {
        console.log("🔴 Fin del diálogo. No hay más entradas en scene.dialogs.")
        return
    }

    console.log(`📝 Mostrando diálogo: ${dialog.text.join(" ")}`)

    // 🔹 Ocultar la textbox al cambiar fondo (si corresponde)
    scene.textboxText.style.display = "none"

    // 1) Mostramos o no el speakerNameBox
    if (!dialog.speakerName || dialog.speakerName.toLowerCase() === "narrador") {
        // Narrador => texto en cursiva, oculta la imagen
        scene.speakerNameBox.style.display = "none"
        scene.npcImage.style.display = "none"

        // Reemplazamos su texto normal con <i> ... </i>
        if (dialog.text && dialog.text.length > 0) {
            let narradorText = dialog.text[0]
            dialog.text[0] = `<i>${narradorText}</i>`
        }
    } else {
        // Si no es narrador => mostramos su nombre y su imagen
        scene.speakerNameBox.style.display = "block"
        scene.speakerNameBox.innerHTML = dialog.speakerName

        // Si hay un 'image' => lo mostramos
        if (dialog.image) {
            scene.npcImage.style.display = "block"
            scene.npcImage.src = dialog.image
        } else {
            scene.npcImage.style.display = "none"
        }
    }

    // 2) Cambiar fondo si hace falta
    if (dialog.background && dialog.background !== scene.bg.texture.key) {
        console.log(`🎨 Cambiando fondo a: ${dialog.background}`)
        transition_Bg(scene, dialog.background, () => {
            console.log("📝 Iniciando tipeo de texto (con nuevo fondo).")
            startTyping(scene, dialog.text.join(" "))
        })
    } else {
        console.log("📝 Iniciando tipeo de texto SIN cambio de fondo...")
        startTyping(scene, dialog.text.join(" "))
    }
}

// 4️⃣ Ajustar el fondo a pantalla completa
export function resize_bg(scene) {
    if (!scene) {
        console.error("❌ resize_bg() recibió un `scene` indefinido.")
        return
    }
    const width = scene.scale.width
    const height = scene.scale.height
    let newWidth = width, newHeight = width * CONFIG.SCREEN.RATIO

    if (newHeight > height) {
        newHeight = height
        newWidth = height * CONFIG.SCREEN.RATIO
    }

    scene.bg.setPosition(width / 2, height / 2)
    scene.bg.setDisplaySize(newWidth, newHeight)
}


// 5️⃣ Transición de fondo con fade
export function transition_Bg(scene, newImageKey, callback) {
    scene.tweens.add({
        targets: scene.bg,
        alpha: 0,
        duration: CONFIG.TRANSITIONS.FADEOUT_DURATION,
        onComplete: () => {
            scene.bg.setTexture(newImageKey)
            scene.tweens.add({
                targets: scene.bg,
                alpha: 1,
                duration: CONFIG.TRANSITIONS.FADEIN_DURATION,
                onComplete: () => {
                    if (callback) callback()
                }
            })
        }
    })
}
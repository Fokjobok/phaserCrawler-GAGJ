import CONFIG from "./config.js"
import { showMenu, showShopMenu, showNPCSubMenu, showPostDialogueMenu } from "./menus.js"


// Aplica colores a palabras clave
export function applyKeywordColor(text) {
    let coloredText = text

    for (const [keyword, color] of Object.entries(CONFIG.KEYWORDS)) {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi") // Detectar palabra
        coloredText = coloredText.replace(regex, `<span style="color: ${color}">${keyword}</span>`)

    }


    return coloredText
}



// Efecto letra a letra
export function startTyping(scene, fullText) {
    console.log("✍️ Iniciando texto letra a letra...")

    if (!fullText) {
        console.error("❌ No hay texto para mostrar.")


        return
    }

    // Asegurar que textbox sea visible
    scene.textboxText.style.display = "block"
    console.log("📢 Haciendo visible la caja de texto.")


    // Dividimos en palabras para controlar las paginas
    let words = fullText.split(" ")
    let pages = []
    let currentText = ""


    scene.textboxText.innerHTML = ""


    // Generar palabras
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

    // Mostrar cada página letra a letra
    const showCurrentPage = () => {
        scene.turbo = false

        if (currentPage < pages.length) {
            let text = pages[currentPage]
            let index = 0
            let currentTyping = ""

            scene.textboxText.innerHTML = ""
            console.log(`📖 Página ${currentPage + 1}/${pages.length}: "${text}"`)



            const typeWriter = () => {
                if (index < text.length) {
                    currentTyping += text.charAt(index)
                    scene.textboxText.innerHTML = applyKeywordColor(currentTyping)
                    index++

                    setTimeout(typeWriter, scene.turbo ? scene.typingSpeed * scene.typingMultiplier : scene.typingSpeed)
                } else {
                    console.log("✅ Texto completado, esperando Z...")

                    scene.input.keyboard.once('keydown-Z', () => {
                        currentPage++

                        if (currentPage < pages.length) {
                            showCurrentPage()


                        } else {
                            // Cuando no hay más páginas, cerramos textbox
                            scene.textboxText.style.display = "none"
                            scene.speakerNameBox.style.display = "none"
                            scene.npcImage.style.display = "none"
                            scene.currentIndex++

                            if (scene.currentIndex >= scene.dialogs.length) {

                                // Todos los diálogos mostrados
                                showPostDialogueMenu(scene)


                            } else {
                        

                        
                                showDialog(scene)

                            }
                        }
                    })
                }
            }


            typeWriter()

            // Activar "turbo"
            scene.input.keyboard.once('keydown-Z', () => {
                scene.turbo = true
            })
        }
    }


    showCurrentPage()
}





// Mostrar diálogo, fondo e imágenes
export function showDialog(scene) {
    console.log("✅ Ejecutando showDialog()")
    const dialog = scene.dialogs[scene.currentIndex]

    if (!dialog) {
        console.log("🔴 Fin del diálogo. Fin de scene.dialogs.")


        return
    }

    console.log(`📝 Mostrando diálogo: ${dialog.text.join(" ")}`)

    // Ocultar la textbox al cambiar fondo (si corresponde)
    scene.textboxText.style.display = "none"

    // Si no hay speakerName, se asume narrador
    if (!dialog.speakerName || dialog.speakerName.toLowerCase() === "narrador") {

        // Oculta el speakerNameBox y la imagen del NPC
        scene.speakerNameBox.style.display = "none"
        scene.npcImage.style.display = "none"

        // Aplica la clase CSS "narratorText" para cursiva
        scene.textboxText.classList.add("narratorText")

    } else {
        // Si es otro personaje, muestra su nombre y su imagen
        scene.speakerNameBox.style.display = "block"
        scene.speakerNameBox.innerHTML = dialog.speakerName

        // Remueve la clase "narrador" en caso de que estuviera
        scene.textboxText.classList.remove("narratorText")

        if (dialog.image) {
            scene.npcImage.style.display = "block"
            scene.npcImage.src = dialog.image

        } else {
            scene.npcImage.style.display = "none"
        }
    }

    // Cambiar fondo si es necesario
    if (dialog.background && dialog.background !== scene.bg.texture.key) {
        console.log(`🎨 Cambiando fondo a: ${dialog.background}`)

        transition_Bg(scene, dialog.background, () => {
            console.log("📝 Iniciando texto letra a letra con nuevo fondo.")

            startTyping(scene, dialog.text.join(" "))
        })
    } else {
        console.log("📝 Iniciando texto letra a letra...")
        startTyping(scene, dialog.text.join(" "))
    }
}




// Ajustar el fondo fullscreen
export function resize_bg(scene) {
    if (!scene) {
        console.error("❌ resize_bg() `scene` undefined.")
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


// Transición de fondo (fade)
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
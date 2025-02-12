import CONFIG from "../config/config.js"

export class MainMenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MainMenuScene' })

    }


    preload() {
        
    }



    create() {
        let container = this.add.dom(this.cameras.main.width / 2, this.cameras.main.height / 2).createFromHTML(`
            <div style="text-align: center;">
                <h1>Main Menu</h1>
                <input type="text" id="playerNameInput" placeholder="Introduce tu nombre" style="font-size: 24px; padding: 5px;"/>
                <br><br>
                <button id="newGameButton" style="font-size: 24px; padding: 10px;">Entrar</button>
            </div>
        `)


        // Cuando se pulse el botón, se recoge el nombre y se inicia la escena de selección de clase
        container.addListener('click')

        container.on('click', (event) => {

            if (event.target.id === 'newGameButton') {
                let playerName = container.getChildByID('playerNameInput').value

                if (playerName && playerName.trim() !== "") {
                    this.scene.start('SelectClassScene', { playerName: playerName })

                } else {
                    alert("Por favor, introduce un nombre.")

                }
            }
        })
    }
}
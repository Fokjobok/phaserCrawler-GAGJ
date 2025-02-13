import CONFIG from './config/config.js'
import { SelectClassScene } from './scenes/SelectClassScene.js'
import { IntroScene } from './scenes/IntroScene.js'
import { MainMenuScene } from './scenes/MainMenuScene.js'
import { VnScene } from './scenes/VnScene.js'

const sConfig = {
    type: Phaser.AUTO,
    width: CONFIG.SCREEN.WIDTH,
    height: CONFIG.SCREEN.HEIGHT,
    parent: 'game-container',
    dom: { createContainer: true },

    scene: [MainMenuScene, SelectClassScene, VnScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        premultipliedAlpha: false,
        mipmapFilter: "NEAREST"
    }
}

const game = new Phaser.Game(sConfig)
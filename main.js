import CONFIG from './config/config.js'
import { CharacterDataScene } from './scenes/CharacterDataScene.js'
import { IntroScene } from './scenes/IntroScene.js'
import { MainMenuScene } from './scenes/MainMenuScene.js'
import { VnScene } from './scenes/VnScene.js'

import { DcScene } from './scenes/DcScene.js'

const sConfig = {
    type: Phaser.AUTO,
    width: CONFIG.SCREEN.WIDTH,
    height: CONFIG.SCREEN.HEIGHT,
    canvasStyle: 'display:block',
    pixelArt: false,
    parent: 'game-container',
    dom: { createContainer: true },

    scene: [MainMenuScene, CharacterDataScene, IntroScene, DcScene, VnScene],
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

import Phaser from 'phaser'
import Level from './scenes/Level'
import Menu from './scenes/Menu'
import Preload from './scenes/Preload'

class Boot extends Phaser.Scene {
    constructor() {
        super('Boot')
    }

    preload() {
        this.load.pack('pack', 'assets/preload-asset-pack.json')
    }

    create() {
        this.scene.start('Preload')
    }
}

window.addEventListener('load', function () {
    const game = new Phaser.Game({
        width: 1280,
        height: 720,
        backgroundColor: '#2f2f2f',
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.ScaleModes.FIT,
            autoCenter: Phaser.Scale.Center.CENTER_BOTH,
        },
        scene: [Boot, Preload, Menu, Level],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0, x: 0 },
            },
        },
    })
    game.scene.start('Boot')
})

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

    createServerConnection() {
        let socket

        if (location.hostname === 'localhost') {
            socket = new WebSocket('ws://localhost:9000')
        } else {
            socket = new WebSocket('ws://116.203.15.40:9000')
        }

        socket.addEventListener('close', (event) => {
            alert('Server is down, please (re)start the server + F5!')
        })

        socket.addEventListener('message', (event) => {
            let data = JSON.parse(event.data)
            console.log(data)

            //socket.send(JSON.stringify({ "type": "joinRoom", "roomId": roomId, "playerName": playerName }));
        })
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

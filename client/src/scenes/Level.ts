import { Enemy } from '../classes/Enemy'
import { Player } from '../classes/Player'

export default class Level extends Phaser.Scene {
    constructor() {
        super('Level')

        /* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    editorCreate(): void {
        this.events.emit('scene-awake')
    }

    /* START-USER-CODE */
    private player_1!: Player
    private enemy_1?: Enemy
    private path!: Phaser.Curves.Path

    create() {
        this.editorCreate()
        this.createServerConnection()

        const obstacles = this.physics.add.staticGroup()
        obstacles.create(300, 300, 'guapen').setScale(0.3)

        this.player_1 = new Player(this, 400, 300)

        // Define the path
        this.path = this.add.path(1200, 100)
        this.path.lineTo(1200, 300)
        this.path.lineTo(800, 300)
        this.path.lineTo(800, 150)
        this.path.lineTo(1000, 150)
        this.path.lineTo(1000, 600)
        this.path.lineTo(600, 600)

        const graphics = this.add.graphics()
        graphics.lineStyle(1, 0xffffff, 1)
        this.path.draw(graphics)

        const enemy = new Enemy(this, 1200, 100)
        this.enemy_1 = this.add.follower(this.path, enemy.x, enemy.y, enemy.texture.key)
        this.enemy_1.startFollow({
            duration: 5000,
            yoyo: false,
            repeat: -1,
            rotateToPath: true
        })
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        this.player_1.update(cursors, delta)
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
}

/* END OF COMPILED CODE */

// You can write more code here

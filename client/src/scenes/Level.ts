// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */
import { Player } from '../classes/Player'

export default class Level extends Phaser.Scene {
    constructor() {
        super('Level')

        /* START-USER-CTR-CODE */
        console.log('asdfasdf')
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    editorCreate(): void {
        this.events.emit('scene-awake')
    }

    /* START-USER-CODE */
    private player_1!: Player
    private enemy_1?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody

    create() {
        this.editorCreate()
        this.createServerConnection()

        const obstacles = this.physics.add.staticGroup()
        obstacles.create(300, 300, 'guapen').setScale(0.3)

        this.player_1 = new Player(this, 400, 300)

        // Please create a new enemy in classes/Enemy.ts
        const enemy = this.physics.add
            .staticSprite(800, 600, 'FufuSuperDino')
            .setScale(0.3)
        this.physics.add.collider(enemy, obstacles)
        enemy.setTint(0xff0000)

        this.enemy_1 = enemy
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

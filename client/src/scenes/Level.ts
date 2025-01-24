// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */
import { Enemy } from '../classes/Enemy'
import { Player } from '../classes/Player'
import io from 'socket.io-client'

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
    private enemy_1?: Enemy

    create() {
        this.editorCreate()
        this.createServerConnection()

        const obstacles = this.physics.add.staticGroup()
        obstacles.create(300, 300, 'guapen').setScale(0.3)

        this.player_1 = new Player(this, 400, 300)
        this.enemy_1 = new Enemy(this, 800, 600)
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        this.player_1.update(cursors, delta)
    }

    createServerConnection() {
        let socket
        if (location.hostname === 'localhost') {
            socket = io('http://localhost:9000')
        } else {
            socket = io('116.203.15.40:9000')
        }

        socket.on('disconnect', () => {
            alert('Server is down, please (re)start the server + F5!')
        })

        // socket.addEventListener('message', (event) => {
        //     let data = JSON.parse(event.data)
        //     console.log(data)

        //     //socket.send(JSON.stringify({ "type": "joinRoom", "roomId": roomId, "playerName": playerName }));
        // })
    }
}

/* END OF COMPILED CODE */

// You can write more code here

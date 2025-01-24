// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */
import { Enemy } from '../classes/Enemy'
import { Player } from '../classes/Player'
import { type Socket } from 'socket.io-client'

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
    private socket!: Socket

    create() {
        this.editorCreate()
        // this.createServerConnection()

        const obstacles = this.physics.add.staticGroup()
        obstacles.create(300, 300, 'guapen').setScale(0.3)

        this.player_1 = new Player(this, 400, 300, this.socket)
        this.enemy_1 = new Enemy(this, 800, 600)
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        this.player_1.update(cursors, delta)
    }
}

/* END OF COMPILED CODE */

// You can write more code here

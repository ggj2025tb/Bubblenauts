// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */
import { Base } from '../classes/Base'
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
    private path!: Phaser.Curves.Path
    private base?: Base

    create() {
        this.editorCreate()
        // this.createServerConnection()

        const obstacles = this.physics.add.staticGroup()
        obstacles.create(300, 300, 'guapen').setScale(0.3)

        this.player_1 = new Player(this, 400, 300, this.socket)
        this.enemy_1 = new Enemy(this, 800, 600)
        this.base = new Base(this, 100, 100)

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
        this.enemy_1 = this.add.follower(
            this.path,
            enemy.x,
            enemy.y,
            enemy.texture.key
        )
        this.enemy_1.startFollow({
            duration: 5000,
            yoyo: false,
            repeat: -1,
            rotateToPath: true,
        })
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        this.player_1.update(cursors, delta)
        this.base?.update(time, delta)
    }
}

/* END OF COMPILED CODE */

// You can write more code here

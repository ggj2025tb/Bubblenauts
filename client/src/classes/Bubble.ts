import { Actor } from './Actor'
import { Socket } from 'socket.io-client'
export class Bubble extends Actor {
    private pathArray: number[][]
    private speed: number = 50
    public healthBar: Phaser.GameObjects.Text
    private lastHealthUpdateTime: number = 0
    private socket: Socket

    constructor(
        scene: Phaser.Scene,
        bubbleStart: number[],
        pathArray: number[][],
        socket: Socket
    ) {
        super(scene, bubbleStart[0], bubbleStart[1], 'FufuSuperDino')
        // PHYSICS
        this.getBody().setSize(10, 10)
        this.getBody().setOffset(8, 0)
        this.setTint(0xf00ff0)
        this.scale = 0.3
        this.pathArray = pathArray
        this.healthBar = scene.add.text(
            bubbleStart[0] - 35,
            bubbleStart[1] - 60,
            this.health.toString() + '% Life'
        )
        this.socket = socket
    }

    updateHealth(time: number, delta: number): void {
        if (time - this.lastHealthUpdateTime > 200) {
            this.health -= 1

            this.healthBar.text = this.health + '% Life'
            this.lastHealthUpdateTime = time

            this.socket.emit('bubbleHealthUpdate', {
                health: this.health,
            })

            if (this.health <= 0) {
                this.socket.emit('gameOver')
                this.scene.scene.start('GameOver')
            }
        }
    }

    update(time: number, delta: number): void {
        if (this.pathArray.length !== 0) {
            // move to pathArray[0]
            this.scene.physics.moveTo(
                this,
                this.pathArray[0][0],
                this.pathArray[0][1],
                this.speed
            )

            this.healthBar.setPosition(this.x - 35, this.y - 60)

            // if pathArray[0] is reached, within a 10 pixel range, remove it from pathArray, withour matter
            if (
                Math.abs(this.x - this.pathArray[0][0]) < 10 &&
                Math.abs(this.y - this.pathArray[0][1]) < 10
            ) {
                this.pathArray.shift()

                if (this.pathArray.length === 0) {
                    // todo: do something, like getting bubble coins
                    this.destroy()
                    this.socket.emit('waveCompleted')
                }
            }
        }
    }
}

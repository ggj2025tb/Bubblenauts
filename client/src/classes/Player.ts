import { Actor } from './Actor'
import { Socket } from 'socket.io-client'

export class Player extends Actor {
    private readonly MOVEMENT_SPEED = 180
    private readonly MAX_SPEED = 160
    private readonly DRAG = 800

    private keyW: Phaser.Input.Keyboard.Key
    private keyA: Phaser.Input.Keyboard.Key
    private keyS: Phaser.Input.Keyboard.Key
    private keyD: Phaser.Input.Keyboard.Key
    private readonly playerName: string
    public label: Phaser.GameObjects.Text
    private socket: Socket

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        socket: Socket,
        playerName: string
    ) {
        super(scene, x, y, 'FufuSuperDino')
        this.socket = socket
        this.playerName = playerName
        // KEYS
        this.keyW = this.scene.input.keyboard.addKey('W')
        this.keyA = this.scene.input.keyboard.addKey('A')
        this.keyS = this.scene.input.keyboard.addKey('S')
        this.keyD = this.scene.input.keyboard.addKey('D')
        // PHYSICS
        this.getBody().setSize(30, 30)
        this.getBody().setOffset(8, 0)
        this.getBody().setDrag(this.DRAG, this.DRAG)
        this.getBody().setMaxVelocity(this.MAX_SPEED, this.MAX_SPEED)
        this.label = scene.add.text(x, y + 120, this.playerName)
    }

    update(): void {
        if (this.keyW?.isDown) {
            this.body.velocity.y = -this.MOVEMENT_SPEED
        }
        if (this.keyA?.isDown) {
            this.body.velocity.x = -this.MOVEMENT_SPEED
            this.checkFlip()
            this.getBody().setOffset(48, 15)
        }
        if (this.keyS?.isDown) {
            this.body.velocity.y = this.MOVEMENT_SPEED
        }
        if (this.keyD?.isDown) {
            this.body.velocity.x = this.MOVEMENT_SPEED
            this.checkFlip()
            this.getBody().setOffset(15, 15)
        }

        this.label.setPosition(this.x, this.y + 120)

        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.socket.emit('playerUpdate', {
                x: this.x,
                y: this.y,
                direction: this.scaleX,
            })
        }
    }
}

import { Actor } from './Actor'
import { Weapon } from './Weapon'
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
    public healthBar: Phaser.GameObjects.Text
    private socket: Socket
    private weapon: Weapon

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        socket: Socket,
        playerName: string
    ) {
        super(scene, x, y, 'player')
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

        // Weapon
        this.weapon = new Weapon(scene, this)

        this.label = scene.add.text(x, y - 160, this.playerName)
        this.healthBar = scene.add.text(x, y - 140, this.health.toString())
    }

    update(): void {
        if (this.keyW?.isDown) {
            this.body.velocity.y = -this.MOVEMENT_SPEED
            this.anims.play('up', true)
        }
        if (this.keyA?.isDown) {
            this.body.velocity.x = -this.MOVEMENT_SPEED
            this.checkFlip()
            this.getBody().setOffset(48, 15)
            this.anims.play('walk', true)
        }
        if (this.keyS?.isDown) {
            this.body.velocity.y = this.MOVEMENT_SPEED
            this.anims.play('down', true)
        }
        if (this.keyD?.isDown) {
            this.body.velocity.x = this.MOVEMENT_SPEED
            this.checkFlip()
            this.getBody().setOffset(15, 15)
            this.anims.play('walk', true)
        }
        if(this.keyW?.isUp && this.keyA?.isUp && this.keyS?.isUp && this.keyD?.isUp) {
            this.anims.play('idle', true)
        }

        this.label.setPosition(this.x, this.y - 160)
        this.healthBar.setPosition(this.x - 16, this.y - 60)

        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.socket.emit('playerUpdate', {
                x: this.x,
                y: this.y,
                direction: this.scaleX,
            })
        }
    }

    public getWeapon(): Weapon {
        return this.weapon
    }
}

import { Actor } from './Actor'
import { WeaponManager } from './WeaponManager'
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
    private weaponManager: WeaponManager
    private lastHealthUpdateTime: number = 0

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
        this.weapon = new Weapon(scene, this, Phaser.Input.Pointer, 'dreizack')

        this.label = scene.add.text(x - 16, y - 80, this.playerName)
        this.healthBar = scene.add.text(
            x - 16,
            y - 60,
            this.health.toString() + '% Air'
        )

        this.weaponManager = new WeaponManager(scene, this, socket)
    }

    updateHealth(time: number, delta: number): void {
        if (time - this.lastHealthUpdateTime > 400) {
            if (
                this.x >= 90 &&
                this.x <= 200 &&
                this.y >= 100 &&
                this.y <= 180
            ) {
                if (this.health < 90) {
                    this.health += 10
                    this.socket.emit('playerHealthUpdate', {
                        health: this.health,
                    })
                } else {
                    this.health = 100
                    this.socket.emit('playerHealthUpdate', {
                        health: this.health,
                    })
                }
            } else {
                if (this.health > 0) {
                    this.health -= 1
                    this.socket.emit('playerHealthUpdate', {
                        health: this.health,
                    })
                } else {
                    this.scene.input.keyboard.enabled = false
                }
            }

            this.healthBar.text = this.health.toString() + '% Air'
            this.lastHealthUpdateTime = time
        }
    }

    update(time: number, delta: number): void {
        this.updateAnimation()
        this.updateHealth(time, delta)

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

        this.label.setPosition(this.x - 16, this.y - 80)
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
    public getCurrentWeapon() {
        return this.weaponManager.getCurrentWeapon()
    }
}

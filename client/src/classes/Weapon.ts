import Phaser from 'phaser'
import { Socket } from 'socket.io-client'

export class Weapon {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private hitBox: Phaser.GameObjects.Rectangle
    private isAttacking: boolean = false
    private attackCooldown: number = 500 // milliseconds
    private lastAttackTime: number = 0

    constructor(scene: Phaser.Scene, player: Phaser.GameObjects.GameObject) {
        this.scene = scene
        this.player = player

        // Create an invisible hit box for sword range
        this.hitBox = scene.add.rectangle(0, 0, 50, 30, 0xff0000, 0)
        scene.physics.add.existing(this.hitBox, false)

        // Listen for attack input
        scene.input.keyboard.on('keydown-SPACE', this.attack, this)
    }

    private attack(): void {
        const currentTime = this.scene.time.now

        // Check attack cooldown
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            return
        }

        this.isAttacking = true
        this.lastAttackTime = currentTime

        // Determine attack direction based on player's scale
        const player: any = this.player
        const offsetMultiplier = player.scaleX < 0 ? -1 : 1

        // Position hit box relative to player
        this.hitBox.x = player.x + 50 * offsetMultiplier
        this.hitBox.y = player.y

        // Visual/animation feedback (optional)
        this.scene.tweens.add({
            targets: this.hitBox,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.isAttacking = false
            },
        })

        // Emit attack event to server (for multiplayer synchronization)
        const socket: Socket = (player as any).socket
        socket.emit('playerAttack', {
            x: this.hitBox.x,
            y: this.hitBox.y,
            direction: player.scaleX,
        })
    }

    public getHitBox(): Phaser.GameObjects.Rectangle {
        return this.hitBox
    }

    public isCurrentlyAttacking(): boolean {
        return this.isAttacking
    }
}

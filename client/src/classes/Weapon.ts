import Phaser from 'phaser'
import { Socket } from 'socket.io-client'
import { Enemy } from './Enemy'

export class Weapon {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private hitBox: Phaser.GameObjects.Rectangle
    private isAttacking: boolean = false
    private attackCooldown: number = 500 // milliseconds
    private lastAttackTime: number = 0
    private damage: number = 20 // Base damage value

    constructor(scene: Phaser.Scene, player: Phaser.GameObjects.GameObject) {
        this.scene = scene
        this.player = player

        console.log('Weapon initialized', {
            scene: !!scene,
            player: !!player,
        })

        // Create an invisible hit box for sword range
        this.hitBox = scene.add.rectangle(0, 0, 50, 30, 0xff0000, 0.2)
        scene.physics.add.existing(this.hitBox, false)

        // Listen for attack input
        scene.input.keyboard.on('keydown-SPACE', this.attack, this)
        console.log('Attack listener added')
    }

    private attack(): void {
        console.log('Attack method triggered')
        const currentTime = this.scene.time.now

        // Check attack cooldown
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            console.log('Attack on cooldown')
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

        console.log('Hitbox positioned', {
            x: this.hitBox.x,
            y: this.hitBox.y,
        })

        // Check for enemy collisions
        const enemies: Enemy[] = (this.scene as any).enemies || []
        console.log('Enemies count:', enemies.length)

        enemies.forEach((enemy, index) => {
            console.log(`Checking enemy ${index}`)
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.hitBox.getBounds(),
                    enemy.getBounds()
                )
            ) {
                console.log(`Enemy ${index} hit!`)
                this.damageEnemy(enemy)
            }
        })

        // Visual feedback
        this.scene.tweens.add({
            targets: this.hitBox,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.isAttacking = false
            },
        })
    }

    private damageEnemy(enemy: Enemy): void {
        console.log('Damaging enemy', {
            damage: this.damage,
            enemyCurrentHeahlth: enemy.health,
        })
        enemy.getDamage(this.damage)

        // Optional: Knockback effect
        const knockbackForce = 100
        const player: any = this.player
        const direction = player.scaleX < 0 ? -1 : 1
        enemy.body.velocity.x = knockbackForce * direction
        enemy.body.velocity.y = -50 // Slight upward push
    }

    public getHitBox(): Phaser.GameObjects.Rectangle {
        return this.hitBox
    }

    public isCurrentlyAttacking(): boolean {
        return this.isAttacking
    }
}

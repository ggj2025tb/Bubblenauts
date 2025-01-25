import Phaser from 'phaser'
import { Enemy } from './Enemy'
import { Socket } from 'socket.io-client'

export class Weapon {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private mousePointer: Phaser.Input.Pointer
    private hitBox: Phaser.GameObjects.Rectangle
    private isAttacking: boolean = false
    private attackCooldown: number = 500
    private lastAttackTime: number = 0
    private damage: number = 20
    private maxRange: number = 50
    private weaponSprite: string
    private socket: Socket

    constructor(
        scene: Phaser.Scene,
        player: Phaser.GameObjects.GameObject,
        mousePointer: Phaser.Input.Pointer,
        weaponSprite: string
    ) {
        this.scene = scene
        this.player = player
        this.mousePointer = mousePointer
        this.weaponSprite = weaponSprite
        this.socket = this.scene.registry.get('socket')

        this.hitBox = scene.add.rectangle(0, 0, 50, 30, 0xff0000, 0.2)
        scene.physics.add.existing(this.hitBox, false)
    }

    public attack(): void {
        const currentTime = this.scene.time.now
        const player: any = this.player

        // Check attack cooldown
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            return
        }

        // Determine attack constraints based on player movement
        const mouseAngle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            this.mousePointer.worldX,
            this.mousePointer.worldY
        )

        this.isAttacking = true
        this.lastAttackTime = currentTime

        // Calculate attack position
        const distance = Math.min(
            Phaser.Math.Distance.Between(
                player.x,
                player.y,
                this.mousePointer.worldX,
                this.mousePointer.worldY
            ),
            this.maxRange
        )

        // Position hit box
        this.hitBox.x = player.x + Math.cos(mouseAngle) * distance
        this.hitBox.y = player.y + Math.sin(mouseAngle) * distance

        // Check for enemy collisions
        const enemies: Enemy[] = (this.scene as any).enemies || []
        enemies.forEach((enemy) => {
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.hitBox.getBounds(),
                    enemy.getBounds()
                )
            ) {
                this.damageEnemy(enemy)
                this.socket.emit('enemyGetDamage', {
                    enemyId: enemy.id,
                    damage: this.damage,
                })
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
        enemy.getDamage(this.damage)
    }

    public isCurrentlyAttacking(): boolean {
        return this.isAttacking
    }
}

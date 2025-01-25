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
        const isMoving =
            player.body.velocity.x !== 0 || player.body.velocity.y !== 0
        const mouseAngle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            this.mousePointer.worldX,
            this.mousePointer.worldY
        )

        // Check if attack direction is valid
        // const isValidAttackDirection = isMoving
        //     ? this.isPointingInFacingDirection()
        //     : this.isValidIdleAttackDirection(mouseAngle, player.scaleX)

        // if (!isValidAttackDirection) {
        //     return
        // }

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

    private isValidIdleAttackDirection(
        angle: number,
        playerScaleX: number
    ): boolean {
        // When idle, allow horizontal attacks left and right
        return playerScaleX > 0
            ? angle > -Math.PI / 2 && angle < Math.PI / 2 // Facing right
            : angle < -Math.PI / 2 || angle > Math.PI / 2 // Facing left
    }

    private isPointingInFacingDirection(): boolean {
        const player: any = this.player
        const mouseAngle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            this.mousePointer.worldX,
            this.mousePointer.worldY
        )

        // When moving, restrict to forward direction
        return player.scaleX > 0
            ? mouseAngle > -Math.PI / 2 && mouseAngle < Math.PI / 2
            : mouseAngle < -Math.PI / 2 || mouseAngle > Math.PI / 2
    }

    private damageEnemy(enemy: Enemy): void {
        enemy.getDamage(this.damage)
    }

    public isCurrentlyAttacking(): boolean {
        return this.isAttacking
    }
}

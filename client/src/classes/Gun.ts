import { Socket } from 'socket.io-client'
import { Enemy } from './Enemy'

export class Gun {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private socket: Socket
    private mousePointer: Phaser.Input.Pointer
    private projectiles: Phaser.Physics.Arcade.Group
    private isAttacking: boolean = false
    private attackCooldown: number = 300
    private lastAttackTime: number = 0
    private damage: number = 15

    constructor(
        scene: Phaser.Scene,
        player: Phaser.GameObjects.GameObject,
        mousePointer: Phaser.Input.Pointer,
        socket: Socket
    ) {
        this.scene = scene
        this.player = player
        this.mousePointer = mousePointer
        this.socket = socket

        this.projectiles = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 20,
            runChildUpdate: true,
        })
    }

    public attack(): void {
        const currentTime = this.scene.time.now
        const player: any = this.player

        // Check attack cooldown and facing direction
        if (
            currentTime - this.lastAttackTime < this.attackCooldown ||
            !this.isPointingInFacingDirection()
        ) {
            return
        }

        this.isAttacking = true
        this.lastAttackTime = currentTime

        // Calculate angle to mouse pointer
        const angle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            this.mousePointer.worldX,
            this.mousePointer.worldY
        )

        // Create projectile
        const projectile = this.projectiles.get(player.x, player.y, 'Harpune')
        // rotate the projectile

        if (projectile) {
            projectile.setActive(true)
            projectile.setVisible(true)
            projectile.body.enable = true

            // Set velocity based on angle
            const speed = 500
            projectile.body.velocity.x = Math.cos(angle) * speed
            projectile.body.velocity.y = Math.sin(angle) * speed

            // Rotate projectile to face direction
            projectile.setRotation(angle - 80)

            // Set collision and lifecycle
            this.setupProjectileCollision(projectile)

            // Scale projectile
            projectile.setScale(2)
        }
    }

    private isPointingInFacingDirection(): boolean {
        const player: any = this.player
        const mouseAngle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            this.mousePointer.worldX,
            this.mousePointer.worldY
        )

        // Check if mouse is in front of player based on player's scale
        return player.scaleX > 0
            ? mouseAngle > -Math.PI / 2 && mouseAngle < Math.PI / 2
            : mouseAngle < -Math.PI / 2 || mouseAngle > Math.PI / 2
    }

    private setupProjectileCollision(projectile: Phaser.Physics.Arcade.Image) {
        const enemies: Enemy[] = (this.scene as any).enemies || []

        this.scene.time.delayedCall(1000, () => {
            if (projectile.active) {
                projectile.destroy()
            }
        })

        enemies.forEach((enemy) => {
            this.scene.physics.add.overlap(projectile, enemy, () => {
                this.damageEnemy(enemy)
                projectile.destroy()
            })
        })
    }

    private damageEnemy(enemy: Enemy): void {
        enemy.getDamage(this.damage)
    }

    public isCurrentlyAttacking(): boolean {
        return this.isAttacking
    }
}

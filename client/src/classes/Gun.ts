import { Socket } from 'socket.io-client'
import { Enemy } from './Enemy'

export class Gun {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private socket: Socket
    private projectiles: Phaser.Physics.Arcade.Group
    private isAttacking: boolean = false
    private attackCooldown: number = 300 // milliseconds
    private lastAttackTime: number = 0
    private damage: number = 15 // Base damage value

    constructor(
        scene: Phaser.Scene,
        player: Phaser.GameObjects.GameObject,
        socket: Socket
    ) {
        this.scene = scene
        this.player = player
        this.socket = socket

        // Create a physics group for projectiles
        this.projectiles = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 20,
            runChildUpdate: true,
        })

        // Listen for shoot input
        scene.input.on('pointerdown', this.shoot, this)
    }

    private shoot(): void {
        const currentTime = this.scene.time.now

        // Check attack cooldown
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            return
        }

        this.isAttacking = true
        this.lastAttackTime = currentTime

        // Determine shoot direction based on player's scale
        const player: any = this.player
        const offsetMultiplier = player.scaleX < 0 ? -1 : 1

        // Create projectile
        const projectile = this.projectiles.get(
            player.x + 50 * offsetMultiplier,
            player.y,
            'bullet' // You'll need to preload this sprite
        )

        if (projectile) {
            projectile.setActive(true)
            projectile.setVisible(true)
            projectile.body.enable = true

            // Set velocity based on player's facing direction
            const speed = 500
            projectile.body.velocity.x = speed * offsetMultiplier

            // Set collision and lifecycle
            this.setupProjectileCollision(projectile)
        }
    }

    private setupProjectileCollision(projectile: Phaser.Physics.Arcade.Image) {
        const enemies: Enemy[] = (this.scene as any).enemies || []

        // Destroy projectile after certain distance or time
        this.scene.time.delayedCall(1000, () => {
            if (projectile.active) {
                projectile.destroy()
            }
        })

        // Check for enemy collisions
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

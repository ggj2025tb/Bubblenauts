import { Enemy } from './Enemy'
import { Socket } from 'socket.io-client'

export class Gun {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private mousePointer: Phaser.Input.Pointer
    private projectiles: Phaser.Physics.Arcade.Group
    private isAttacking: boolean = false
    private attackCooldown: number = 500
    private lastAttackTime: number = 0
    private damage: number = 15
    private texture: string
    private isRemote: boolean
    private socket: Socket

    constructor(
        scene: Phaser.Scene,
        player: Phaser.GameObjects.GameObject,
        mousePointer: Phaser.Input.Pointer,
        texture: string,
        isRemote: boolean = false
    ) {
        this.scene = scene
        this.player = player
        this.mousePointer = mousePointer
        this.texture = texture

        this.isRemote = isRemote

        this.socket = this.scene.registry.get('socket')

        this.projectiles = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 20,
            runChildUpdate: true,
        })
    }

    public attack(remoteParams?: {
        x: number
        y: number
        angle: number
    }): void {
        const currentTime = this.scene.time.now
        const player: any = this.player

        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            return;
        }

        // For remote projectiles, use provided parameters
        if (this.isRemote && remoteParams) {
            this.createRemoteProjectile(
                remoteParams.x,
                remoteParams.y,
                remoteParams.angle
            )
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
        const projectile = this.projectiles.get(
            player.x,
            player.y,
            this.texture
        )

        if (projectile) {
            projectile.body.onWorldBounds = true
            projectile.setActive(true)
            projectile.setVisible(true)
            projectile.body.enable = true

            // Set velocity based on angle
            const speed = 500
            projectile.body.velocity.x = Math.cos(angle) * speed
            projectile.body.velocity.y = Math.sin(angle) * speed

            // Rotate projectile to face direction
            projectile.setRotation(angle - 80)

            projectile.setScale(2)

            // Set collision and lifecycle
            this.setupProjectileCollision(projectile)
        }
    }

    private createRemoteProjectile(x: number, y: number, angle: number) {
        const projectile = this.projectiles.get(x, y, this.texture)

        if (projectile) {
            projectile.setActive(true)
            projectile.setVisible(true)
            projectile.body.enable = true

            const speed = 500
            projectile.body.velocity.x = Math.cos(angle) * speed
            projectile.body.velocity.y = Math.sin(angle) * speed
            projectile.setRotation(angle - 80)
            projectile.setScale(2)

            this.setupProjectileCollision(projectile)
        }
    }

    private setupProjectileCollision(projectile: Phaser.Physics.Arcade.Image) {
        const enemies: Enemy[] = (this.scene as any).enemies || []

        // Destroy projectile on map boundaries
        this.scene.physics.world.on(
            'worldbounds',
            (body: Phaser.Physics.Arcade.Body) => {
                if (body.gameObject === projectile) {
                    projectile.destroy()
                }
            }
        )

        // Set world bounds for projectile
        projectile.body.setCollideWorldBounds(true)

        // Destroy after 4 second
        this.scene.time.delayedCall(4000, () => {
            if (projectile.active) {
                projectile.destroy()
            }
        })

        // Check enemy collision
        enemies.forEach((enemy) => {
            this.scene.physics.add.overlap(projectile, enemy, () => {
                this.damageEnemy(enemy)
                this.socket.emit('enemyGetDamage', {
                    enemyId: enemy.id,
                    damage: this.damage,
                })
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

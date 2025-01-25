import { Actor } from './Actor'
import { Bubble } from './Bubble'

export class Enemy extends Actor {
    private bubbleToFollow: Bubble
    private speed: number = 50
    private bubbles: Bubble[]
    private isDying: boolean = false
    public health: number
    public id: string

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        bubbles: Bubble[],
        id: string
    ) {
        super(scene, x, y, 'enemy_1')
        // PHYSICS
        this.getBody().setSize(10, 10)
        this.getBody().setOffset(8, 0)
        this.scale = 1
        this.health = 100 // Override default health from Actor
        this.id = id

        // Select random bubble
        this.bubbles = bubbles
        this.selectNewBubble()
    }

    update(time: number, delta: number): void {
        // Stop moving if dying
        if (this.isDying) return

        if (this.bubbleToFollow === undefined) {
            this.anims.play('enemy_1_walk', true)
            this.selectNewBubble()
            // No new bubble found, do nothing
            if (this.bubbleToFollow === undefined) {
                return
            }
        }

        this.scene.physics.moveTo(
            this,
            this.bubbleToFollow.x,
            this.bubbleToFollow.y,
            this.speed
        )
    }

    selectNewBubble(): void {
        if (this.bubbles !== undefined) {
            // Select random bubble
            this.bubbleToFollow = Phaser.Math.RND.pick(this.bubbles)
        }
    }

    override getDamage(value?: number): void {
        if (this.isDying) return

        super.getDamage(value)

        // Optional: Flash red when hit
        this.scene.time.delayedCall(100, () => {
            this.clearTint()
        })
    }

    public die(): void {
        this.isDying = true

        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Remove from scene and enemies array
                const index = (this.scene as any).enemies.indexOf(this)
                if (index > -1) {
                    ;(this.scene as any).enemies.splice(index, 1)
                }
                this.anims.play('enemy_1_death')
                this.destroy()
            },
        })
    }
}

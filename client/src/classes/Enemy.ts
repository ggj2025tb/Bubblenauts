import { Actor } from './Actor'
import { Bubble } from './Bubble'

export class Enemy extends Actor {
    private bubbleToFollow: Bubble
    private speed: number = 50
    private bubbles: Bubble[]
    private isDying: boolean = false

    constructor(scene: Phaser.Scene, x: number, y: number, bubbles: Bubble[]) {
        super(scene, x, y, 'FufuSuperDino')
        // PHYSICS
        this.getBody().setSize(10, 10)
        this.getBody().setOffset(8, 0)
        this.setTint(0xff0000)
        this.scale = 0.2
        this.hp = 100 // Override default HP from Actor

        // Select random bubble
        this.bubbles = bubbles
        this.selectNewBubble()
    }

    update(time: number, delta: number): void {
        // Stop moving if dying
        if (this.isDying) return

        if (this.bubbleToFollow === undefined) {
            this.selectNewBubble()
        }

        this.scene.physics.moveTo(
            this,
            this.bubbleToFollow.x,
            this.bubbleToFollow.y,
            this.speed
        )

        // Check if enemy is dead
        if (this.hp <= 0) {
            this.die()
        }
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
        this.setTint(0xff0000)
        this.scene.time.delayedCall(100, () => {
            this.clearTint()
        })
    }

    private die(): void {
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
                this.destroy()
            },
        })
    }
}

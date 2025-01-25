import { Actor } from './Actor'
import { Bubble } from './Bubble'
export class Enemy extends Actor {
    private bubbleToFollow: Bubble;
    private speed: number = 50;
    private bubbles: Bubble[];

    constructor(scene: Phaser.Scene, x: number, y: number, bubbles: Bubble[]) {
        super(scene, x, y, 'FufuSuperDino')
        // PHYSICS
        this.getBody().setSize(10, 10)
        this.getBody().setOffset(8, 0)
        this.setTint(0xff0000)
        this.scale = 0.2;

        // Select random bubble
        this.bubbles = bubbles;
        this.selectNewBubble();
    }

    update(time: number, delta: number): void {
        if (this.bubbleToFollow === undefined) {
            this.selectNewBubble();
        }

        this.scene.physics.moveTo(
            this,
            this.bubbleToFollow.x,
            this.bubbleToFollow.y,
            this.speed
        );
    }

    selectNewBubble(): void {
        if (this.bubbles !== undefined) {
            // Select random bubble
            this.bubbleToFollow = Phaser.Math.RND.pick(this.bubbles);
        }
    }
}

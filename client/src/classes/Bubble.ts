import { Actor } from './Actor'
export class Bubble extends Actor {
    private pathArray: number[][];
    private speed: number = 50;

    constructor(scene: Phaser.Scene, bubbleStart: number[], pathArray: number[][]) {
        super(scene, bubbleStart[0], bubbleStart[1], 'FufuSuperDino')
        // PHYSICS
        this.getBody().setSize(10, 10)
        this.getBody().setOffset(8, 0)
        this.setTint(0xf00ff0)
        this.scale = 0.3
        this.pathArray = pathArray;
    }

    update(time: number, delta: number): void {
        if (this.pathArray.length !== 0) {
            // move to pathArray[0]
            this.scene.physics.moveTo(
                this,
                this.pathArray[0][0],
                this.pathArray[0][1],
                this.speed
            );

            // if pathArray[0] is reached, within a 10 pixel range, remove it from pathArray, withour matter
            if (Math.abs(this.x - this.pathArray[0][0]) < 10 && Math.abs(this.y - this.pathArray[0][1]) < 10) {
                this.pathArray.shift();

                if (this.pathArray.length === 0) {
                    // todo: do something, like getting bubble coins
                    this.destroy();
                }
            }
        }
    }
}

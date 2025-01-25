import { Actor } from './Actor'
export class Enemy extends Actor {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'FufuSuperDino')
        // PHYSICS
        this.getBody().setSize(10, 10)
        this.getBody().setOffset(8, 0)
        this.setTint(0xff0000)
    }
    update(): void {}
}

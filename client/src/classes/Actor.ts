import { Physics } from 'phaser'
export class Actor extends Physics.Arcade.Sprite {
    public health = 100

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame)
        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.getBody().setCollideWorldBounds(true)
    }

    protected checkFlip(): void {
        if (this.body.velocity.x < 0) {
            this.scaleX = 1
        } else {
            this.scaleX = -1
        }
    }
    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body
    }

    protected updateAnimation(): void {
        //same but when two keys are pressed at the same time
        if (this.keyW?.isDown && this.keyA?.isDown) {
            this.anims.play('walk', true)
        } else if (this.keyW?.isDown && this.keyD?.isDown) {
            this.anims.play('walk', true)
        } else if (this.keyS?.isDown && this.keyA?.isDown) {
            this.anims.play('walk', true)
        } else if (this.keyS?.isDown && this.keyD?.isDown) {
            this.anims.play('walk', true)
        } else if (this.keyA?.isDown) {
            this.anims.play('walk', true)
        } else if (this.keyS?.isDown) {
            this.anims.play('down', true)
        } else if (this.keyD?.isDown) {
            this.anims.play('walk', true)
        } else if (this.keyW?.isDown) {
            this.anims.play('up', true)
        } else if (this.keyW?.isUp && this.keyA?.isUp && this.keyS?.isUp && this.keyD?.isUp) {
            this.anims.play('idle', true)
        }
    }
}

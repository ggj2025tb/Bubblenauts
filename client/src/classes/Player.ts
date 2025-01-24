export class Player extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 10

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
        this.body.setCollideWorldBounds(true)
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number) {
        const speed = this.speed * delta

        if (cursors.left.isDown) {
            this.x -= speed
        } else if (cursors.right.isDown) {
            this.x += speed
        } else if (cursors.up.isDown) {
            this.y -= speed
        } else if (cursors.down.isDown) {
            this.y += speed
        }
    }
}

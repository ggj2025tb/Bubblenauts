// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {
    playerSpeed: number = 0.3
    constructor() {
        super('Level')

        /* START-USER-CTR-CODE */
        console.log('asdfasdf')
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    editorCreate(): void {
        // fufuSuperDino
        this.add.image(656, 212, 'FufuSuperDino')

        // text
        const text = this.add.text(640, 458, '', {})
        text.setOrigin(0.5, 0.5)
        text.text = 'Phaser 3 + Phaser Editor v4\nVite + TypeScript'
        text.setStyle({ align: 'center', fontFamily: 'Arial', fontSize: '3em' })

        this.events.emit('scene-awake')
    }

    /* START-USER-CODE */

    // Write your code here

    create() {
        this.editorCreate()

        const obstacles = this.physics.add.staticGroup()
        obstacles.create(300, 300, 'guapen').setScale(0.3)

        this.player = this.physics.add
            .staticSprite(100, 450, 'FufuSuperDino')
            .setScale(0.3)
        this.physics.add.collider(this.player, obstacles)
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        const speed = this.playerSpeed * delta

        if (cursors.left.isDown) {
            this.player.x = this.player.x - speed
        } else if (cursors.right.isDown) {
            this.player.x = this.player.x + speed
        } else if (cursors.up.isDown) {
            this.player.y = this.player.y - speed
        } else if (cursors.down.isDown) {
            this.player.y = this.player.y + speed
        }
    }
}

/* END OF COMPILED CODE */

// You can write more code here

export default class Menu extends Phaser.Scene {
    constructor() {
        super('Menu')
    }

    create() {
        this.add
            .text(100, 100, 'Join Game!', { fill: '#0f0' })
            .setInteractive()
            .on('pointerup', () => {
                this.registry
                    .get('socket')
                    .send(
                        JSON.stringify({
                            type: 'joinGame',
                            playerName: 'dominik' + Date.now(),
                        })
                    )
                this.scene.start('Level')
            })
    }
}

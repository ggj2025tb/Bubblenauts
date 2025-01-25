import type { Socket } from 'socket.io-client'

export default class Menu extends Phaser.Scene {
    private nameInput!: HTMLInputElement
    private socket: Socket

    constructor() {
        super('Menu')
    }

    create() {
        this.socket = this.registry.get('socket')
        if (!this.socket) {
            console.error('No socket found in registry')
            return
        }
        this.nameInput = document.createElement('input')
        this.nameInput.style.position = 'absolute'
        this.nameInput.style.left = '100px'
        this.nameInput.style.top = '50px'
        this.nameInput.style.padding = '8px'
        this.nameInput.style.width = '200px'
        this.nameInput.placeholder = 'Enter your name'
        document.body.appendChild(this.nameInput)

        this.add
            .text(100, 100, 'Join Game!', { fill: '#0f0' })
            .setInteractive()
            .on('pointerup', () => {
                const playerName = this.nameInput.value.trim()
                if (playerName) {
                    this.registry.set('playerName', playerName)
                    document.body.removeChild(this.nameInput)
                    // Start Level scene with socket in registry
                    this.scene.start('Level', { socket: this.socket })
                    this.socket.emit('joinGame', { playerName })
                }
            })
    }

    shutdown() {
        if (this.nameInput && this.nameInput.parentElement) {
            document.body.removeChild(this.nameInput)
        }
    }
}

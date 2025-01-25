import type { Socket } from 'socket.io-client'

export default class Menu extends Phaser.Scene {
    private nameInput!: HTMLInputElement
    private button!: HTMLButtonElement
    private div!: HTMLButtonElement
    private socket: Socket

    constructor() {
        super('Menu')
    }

    create() {
        this.socket = this.registry.get('socket')
        this.nameInput = document.createElement('input')
        this.nameInput.style.width = '200px'
        this.nameInput.style.height = '40px'
        this.nameInput.style.textAlign = 'center'
        this.nameInput.placeholder = 'Enter your name'
        this.nameInput.onkeyup = (e) => {
            if (e.key == 'Enter') {
                this.joinGame(this) // Pass the current context (this) to joinGame
            }
        }
        this.div = document.createElement('div')
        this.div.style.width = '100%'
        this.div.style.textAlign = 'center'
        this.div.style.position = 'absolute'
        this.div.style.top = '250px'
        this.div.appendChild(this.nameInput)

        this.div.appendChild(document.createElement('br'))
        this.div.appendChild(document.createElement('br'))

        this.button = document.createElement('button')
        this.button.style.height = '40px'
        this.button.style.width = '200px'
        this.button.textContent = 'Join Game'
        this.button.onclick = () => this.joinGame(this)
        this.div.appendChild(this.button)

        document.body.appendChild(this.div)
        this.nameInput.focus()
    }

    private joinGame(that) {
        const playerName = that.nameInput.value.trim()
        if (playerName) {
            that.registry.set('playerName', playerName)
            document.body.removeChild(that.div)
            that.scene.start('Level', {
                socket: that.socket,
            })
        }
    }
}

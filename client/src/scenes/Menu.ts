import { Socket } from 'socket.io-client'
export default class Menu extends Phaser.Scene {
    private nameInput!: HTMLInputElement
    private button!: HTMLButtonElement
    private socket!: Socket

    constructor() {
        super('Menu')
    }

    create() {
        const image = this.add.image(0, 0, 'intro')
        image.setOrigin(0, 0)
        image.setDisplaySize(
            this.sys.game.config.width,
            this.sys.game.config.height
        )

        this.socket = this.registry.get('socket')

        // Get existing app div
        const appDiv = document.getElementById('app')

        // Create and style input
        this.nameInput = document.createElement('input')
        // center
        this.nameInput.style.position = 'absolute'
        this.nameInput.style.left = '50%'
        this.nameInput.style.top = '50%'
        this.nameInput.style.transform = 'translate(-50%, -130%)'
        this.nameInput.style.width = '50%'
        this.nameInput.style.textAlign = 'center'
        this.nameInput.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'
        this.nameInput.style.border = 'none'
        this.nameInput.style.outline = 'none'
        this.nameInput.style.fontSize = '3vw'
        this.nameInput.maxLength = 20

        this.nameInput.placeholder = 'Enter your name'
        this.nameInput.onkeyup = (e) => {
            if (e.key == 'Enter') {
                this.joinGame(this)
            }
        }

        // Create and style button
        this.button = document.createElement('button')
        this.button.style.position = 'absolute'
        this.button.style.left = '50%'
        this.button.style.top = '50%'
        this.button.style.transform = 'translate(-50%, 10%)'
        this.button.style.width = '40%'
        this.button.style.height = '30%'
        this.button.style.opacity = '0.0'
        this.button.onclick = () => this.joinGame(this)

        // Append elements to app div
        appDiv?.appendChild(this.nameInput)
        appDiv?.appendChild(this.button)
        this.nameInput.focus()
    }

    private joinGame(that) {
        const playerName = that.nameInput.value.trim()

        // Check if username is empty
        if (!playerName) {
            alert('Please enter a username!')
            return
        }

        // Check if game is already running by checking number of players in gameState
        that.socket.emit('checkGameState', {}, (gameStarted: boolean) => {
            if (gameStarted) {
                alert(
                    'A game is already in progress. Please wait until it ends.'
                )
                return
            }

            // If all checks pass, start the game
            that.registry.set('playerName', playerName)
            document.body.removeChild(that.div)
            that.scene.start('Level', {
                socket: that.socket,
            })
        })
    }
}

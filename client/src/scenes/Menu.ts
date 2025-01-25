export default class Menu extends Phaser.Scene {
    private nameInput!: HTMLInputElement
    private button!: HTMLButtonElement
    private div!: HTMLButtonElement

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
        this.nameInput = document.createElement('input')
        this.nameInput.style.width = '800px'
        this.nameInput.style.height = '120px'
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
        this.div = document.createElement('div')
        this.div.style.width = '100%'
        this.div.style.textAlign = 'center'
        this.div.style.position = 'absolute'
        this.div.style.top = 'calc(100% - 61%)'
        this.div.appendChild(this.nameInput)

        this.div.appendChild(document.createElement('br'))
        this.div.appendChild(document.createElement('br'))
        this.div.appendChild(document.createElement('br'))
        this.div.appendChild(document.createElement('br'))

        this.button = document.createElement('button')
        this.button.style.height = '100px'
        this.button.style.width = '450px'
        this.button.style.opacity = '0.0'
        // this.button.textContent = 'Join Game'
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

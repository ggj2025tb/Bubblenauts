// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { Base } from '../classes/Base'
import { Enemy } from '../classes/Enemy'
import { Player } from '../classes/Player'
import { type Socket } from 'socket.io-client'
import type { GameState } from '../../types/ServerTypes'
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {
    constructor() {
        super('Level')

        /* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    editorCreate(): void {
        // level1Map
        const level1Map = this.add.tilemap('BubbleNautsMap')
        level1Map.addTilesetImage('Decoration', 'decoration')
        level1Map.addTilesetImage('Bubbles', 'bubbles')
        level1Map.addTilesetImage('Player', 'player')
        level1Map.addTilesetImage('Environment', 'environment')
        level1Map.createLayer('Ground', ['Environment'], 0, 0)
        level1Map.createLayer('Walls', ['Environment'], 0, 0)
        level1Map.createLayer('Floor', ['Environment', 'Decoration'], 0, 0)
        level1Map.createLayer('RoadBottom', ['Decoration'], 0, 0)
        level1Map.createLayer('RoadTop', ['Environment', 'Decoration'], 0, 0)
        level1Map.createLayer('Base', ['Environment', 'Decoration'], 0, 0)

        this.level1Map = level1Map

        this.events.emit('scene-awake')
    }

    private level1Map!: Phaser.Tilemaps.Tilemap

    /* START-USER-CODE */
    private player!: Player
    private enemy?: Enemy
    private socket!: Socket
    private path!: Phaser.Curves.Path
    private base?: Base
    private otherPlayers: Map<string, Player> = new Map()
    private playername!: string

    create() {
        this.socket = this.registry.get('socket')
        this.playername = this.registry.get('playerName')

        if (!this.socket) {
            console.error('No socket found in registry')
            this.scene.start('Menu')
            return
        }

        this.editorCreate()

        // Pass socket to Player
        this.player = new Player(this, 400, 300, this.socket, this.playername)
        this.enemy = new Enemy(this, 800, 600)

        this.socket.on('gameState', (gameState: GameState) => {
            // Create sprites for other players EXCEPT current player
            Object.values(gameState.players).forEach((player) => {
                if (player.id !== this.socket.id) {
                    // Skip current player
                    const otherPlayer = new Player(
                        this,
                        player.x,
                        player.y,
                        this.socket,
                        player.name
                    )
                    otherPlayer.setTint(0x00ff00)
                    this.otherPlayers.set(player.id, otherPlayer)
                }
            })
        })

        // Listen for player movement updates
        this.socket.on(
            'playerMoved',
            (playerInfo: {
                id: string
                x: number
                y: number
                direction: number
            }) => {
                const otherPlayer = this.otherPlayers.get(playerInfo.id)
                if (otherPlayer) {
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y)
                    otherPlayer.label.setPosition(playerInfo.x, playerInfo.y + 120)
                    otherPlayer.scaleX = playerInfo.direction
                }
            }
        )

        this.socket.emit('joinGame', { playerName: this.playername })

        // Define the path
        this.path = this.add.path(1200, 100)
        this.path.lineTo(1200, 430)
        this.path.lineTo(1082, 430)
        this.path.lineTo(1082, 208)
        this.path.lineTo(820, 208)
        this.path.lineTo(820, 620)
        this.path.lineTo(975, 620)
        this.path.lineTo(955, 130)
        this.path.lineTo(615, 140)
        this.path.lineTo(590, 530)
        this.path.lineTo(180, 530)
        this.path.lineTo(160, 150)

        const graphics = this.add.graphics()
        graphics.lineStyle(3, 0xffffff, 1)

        //uncomment to show path
        // this.path.draw(graphics)

        const enemy = new Enemy(this, 1200, 100)
        this.enemy = this.add.follower(
            this.path,
            enemy.x,
            enemy.y,
            enemy.texture.key
        )
        this.enemy.startFollow({
            duration: 5000,
            yoyo: false,
            repeat: -1,
            rotateToPath: true,
        })
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        this.player.update(cursors, delta)


        this.base?.update(time, delta)
    }
}

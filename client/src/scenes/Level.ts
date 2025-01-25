// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { Base } from '../classes/Base'
import { Enemy } from '../classes/Enemy'
import { Player } from '../classes/Player'
import { type Socket } from 'socket.io-client'
import type {
    GameState,
    Enemy as ServerEnemy,
    MapData as ServerMapData,
    Bubble as ServerBubble,
} from '../../types/ServerTypes'
import { Bubble } from '../classes/Bubble'
import { EnemySpawner } from '../classes/EnemySpawner'
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
    // enemies will be filled by the EnemySpawner
    private enemies: Enemy[] = []
    private bubbles: Bubble[] = []
    private socket!: Socket
    private base?: Base
    private otherPlayers: Map<string, Player> = new Map()
    private playername!: string
    private enemyInterval: number = 5000
    private enemyWaveCount: number = 5
    private startGameButton!: Phaser.GameObjects.Text

    create() {
        this.socket = this.registry.get('socket')
        this.playername = this.registry.get('playerName')
        this.editorCreate()

        // Pass socket to Player
        this.player = new Player(this, 400, 300, this.socket, this.playername)

        this.cameras.main.setBounds(
            0,
            0,
            this.level1Map.widthInPixels,
            this.level1Map.heightInPixels
        )
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09)
        this.cameras.main.setZoom(1.5)
        // A static button that can be used to send a message to the server
        this.startGameButton = this.add.text(400, 100, 'Start game', {
            fill: '#fff',
            backgroundColor: '#999',
        })
        this.startGameButton.setInteractive()

        this.startGameButton.on('pointerdown', () => {
            const mapData: ServerMapData = {
                enemySpawnPoints: [
                    [1200, 100],
                    [1200, 300],
                    [1200, 500],
                    [1200, 700],
                ],
                enemyPath: [
                    [1200, 430],
                    [1082, 430],
                    [1082, 208],
                    [820, 208],
                    [820, 620],
                    [975, 620],
                    [955, 130],
                    [615, 140],
                    [590, 530],
                    [180, 530],
                    [160, 150],
                ],
                bubbleSpawnPoint: [1200, 100],
                bubblePath: [
                    [1200, 430],
                    [1082, 430],
                    [1082, 208],
                    [820, 208],
                    [820, 620],
                    [975, 620],
                    [955, 130],
                    [615, 140],
                    [590, 530],
                    [180, 530],
                    [160, 150],
                ],
            }
            this.socket.emit('startGame', { mapData })
        })

        this.socket.on('gameState', (gameState: GameState) => {
            this.otherPlayers.forEach((player) => player.destroy())
            this.otherPlayers.forEach((player) => player.label.destroy())
            this.otherPlayers.forEach((player) => player.healthBar.destroy())
            this.otherPlayers.clear()

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

        this.socket.on('enemyDied', (enemyId: string) => {
            const enemy = this.enemies.find((enemy) => enemy.id === enemyId)
            if (enemy) {
                enemy.die()
            }
        })

        this.socket.on('enemyCreated', (enemy: ServerEnemy) => {
            console.log(`Spawning enemy at ${enemy.x}, ${enemy.y}`)
            const newEnemy = new Enemy(
                this,
                enemy.x,
                enemy.y,
                this.bubbles,
                enemy.id
            )
            this.enemies.push(newEnemy)
        })

        this.socket.on('bubbleCreated', (bubble: ServerBubble) => {
            console.log(`Spawning bubble at ${bubble.x}, ${bubble.y}`)
            const newBubble = new Bubble(
                this,
                [bubble.x, bubble.y],
                bubble.pathArray
            )
            this.bubbles.push(newBubble)
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
                    otherPlayer.label.setPosition(
                        playerInfo.x - 16,
                        playerInfo.y - 80
                    )
                    otherPlayer.healthBar.setPosition(
                        playerInfo.x - 16,
                        playerInfo.y - 60
                    )
                    otherPlayer.scaleX = playerInfo.direction
                }
            }
        )

        this.socket.emit('joinGame', { playerName: this.playername })

        const graphics = this.add.graphics()
        graphics.lineStyle(3, 0xffffff, 1)
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        this.player.update(cursors, delta)

        this.base?.update(time, delta)
        this.enemies.forEach((enemy) => {
            enemy.update(time, delta)
        })
        this.bubbles.forEach((bubble) => {
            bubble.update(time, delta)
        })
    }
}

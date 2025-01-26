// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { Base } from '../classes/Base'
import { Enemy } from '../classes/Enemy'
import { Player } from '../classes/Player'
import { Gun } from '../classes/Gun'
import { type Socket } from 'socket.io-client'
import type {
    GameState,
    Enemy as ServerEnemy,
    MapData as ServerMapData,
    Bubble as ServerBubble,
} from '../../types/ServerTypes'
import { Bubble } from '../classes/Bubble'
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
    private startGameButton!: Phaser.GameObjects.Image
    private waveNumber: number
    private waveText!: Phaser.GameObjects.Text
    private mapData!: ServerMapData

    create() {
        this.socket = this.registry.get('socket')
        this.playername = this.registry.get('playerName')
        this.editorCreate()

        this.waveNumber = 0

        // Pass socket to Player
        this.player = new Player(
            this,
            400,
            300,
            this.socket,
            this.playername,
            true
        )

        this.cameras.main.setBounds(
            0,
            0,
            this.level1Map.widthInPixels,
            this.level1Map.heightInPixels
        )
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09)
        this.cameras.main.setZoom(1.5)
        const interfaceimg = this.add.image(0, 0, 'interfaceimg')
        interfaceimg.setOrigin(0, 1)
        interfaceimg.setDisplaySize(560, 96)
        // A static button that can be used to send a message to the server
        this.startGameButton = this.add.image(140, 200, 'StartButtonRendered')
        this.startGameButton.setOrigin(0, 0)
        this.startGameButton.setDisplaySize(144, 48)
        this.startGameButton.setInteractive()

        // display fix wave number but with following camera
        this.add.text(325, 80, 'Wave: ', {
            fontSize: '32px',
            fill: 'white',
        })
        this.waveText = this.add.text(425, 80, this.waveNumber.toString(), {
            fontSize: '32px',
            fill: 'white',
        })

        // Füge text darunter hinzu mit anweisungen
        this.add.text(325, 110, 'Press "WASD" to move', {
            fontSize: '12px',
            fill: 'white',
        })
        this.add.text(325, 130, 'Press "Shift" to dash', {
            fontSize: '12px',
            fill: 'white',
        })
        this.add.text(325, 150, 'Click to shoot/attack', {
            fontSize: '12px',
            fill: 'white',
        })
        this.add.text(325, 170, 'Press "1" or "2" to switch weapon', {
            fontSize: '12px',
            fill: 'white',
        })
        this.add.text(325, 190, 'Regen air in base', {
            fontSize: '12px',
            fill: 'white',
        })

        this.mapData = {
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

        this.startGameButton.on('pointerdown', () => {
            this.startGameButton.alpha = 0.5
            this.startGameButton.disableInteractive()

            const mapData = this.mapData
            this.socket.emit('startGame', { mapData })
        })

        this.socket.on('disableStartButton', () => {
            this.startGameButton.alpha = 0.5
            this.startGameButton.disableInteractive()
        })

        this.socket.on('gameState', (gameState: GameState) => {
            this.otherPlayers.forEach((player) => player.destroy())
            this.otherPlayers.forEach((player) => player.label.destroy())
            this.otherPlayers.forEach((player) => player.healthBar.destroy())
            this.otherPlayers.clear()

            this.waveNumber = gameState.wave
            this.waveText.setText(this.waveNumber.toString())

            // Create sprites for other players EXCEPT current player
            Object.values(gameState.players).forEach((player) => {
                if (player.id !== this.socket.id) {
                    const otherPlayer = new Player(
                        this,
                        player.x,
                        player.y,
                        this.socket,
                        player.name,
                        false // Mark as non-local player
                    )
                    this.otherPlayers.set(player.id, otherPlayer)
                }
            })
        })

        this.socket.on('waveFinished', (wave: number) => {
            this.enemies.forEach((enemy) => enemy.destroy())
            this.enemies = []

            this.bubbles.forEach((bubble) => bubble.destroy())
            this.bubbles = []

            this.waveNumber = wave
            this.waveText.setText(this.waveNumber.toString())

            const mapData = this.mapData
            this.socket.emit('startGame', { mapData })
        })

        this.socket.on('enemyDied', (enemyId: string) => {
            const enemy = this.enemies.find((enemy) => enemy.id === enemyId)
            if (enemy) {
                enemy.die()
            }
        })

        this.socket.on('enemyCreated', (enemy: ServerEnemy) => {
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
                bubble.pathArray,
                this.socket
            )
            this.bubbles.push(newBubble)
        })

        this.socket.on(
            'playerHealthUpdate',
            (playerInfo: { id: string; health: number }) => {
                const otherPlayer = this.otherPlayers.get(playerInfo.id)
                if (otherPlayer) {
                    otherPlayer.healthBar.text =
                        playerInfo.health.toString() + '% Air'
                }
            }
        )

        this.socket.on(
            'bubbleHealthUpdate',
            (bubbleInfo: { id: string; health: number }) => {
                const bubble = this.bubbles[0]
                if (bubble) {
                    bubble.healthBar.text =
                        bubbleInfo.health.toString() + '% Life'
                    bubble.health = bubbleInfo.health
                }
            }
        )

        // Listen for player movement updates
        this.socket.on(
            'playerMoved',
            (playerInfo: {
                id: string
                x: number
                y: number
                direction: number
                animation: string
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

                    // Play animation if different from current
                    if (
                        playerInfo.animation &&
                        otherPlayer.anims.currentAnim?.key !==
                            playerInfo.animation
                    ) {
                        otherPlayer.play(playerInfo.animation)
                    }
                }
            }
        )

        this.socket.on('remotePlayerAttack', (attackData) => {
            const otherPlayer = this.otherPlayers.get(attackData.playerId)
            if (otherPlayer) {
                if (attackData.weaponType === 'gun') {
                    const gunWeapon = new Gun(
                        this,
                        otherPlayer,
                        this.input.activePointer,
                        'dreizack',
                        true // Mark as remote weapon
                    )

                    gunWeapon.attack({
                        x: attackData.x,
                        y: attackData.y,
                        angle: attackData.angle,
                    })
                }
            }
        })

        this.socket.emit('joinGame', { playerName: this.playername })

        const graphics = this.add.graphics()
        graphics.lineStyle(3, 0xffffff, 1)
    }

    update(time: number, delta: number): void {
        this.player.update(time, delta)
        this.base?.update(time, delta)
        this.enemies.forEach((enemy) => {
            enemy.update(time, delta)
        })
        this.bubbles.forEach((bubble) => {
            bubble.update(time, delta)
        })
    }
}

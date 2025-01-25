// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { Base } from '../classes/Base'
import { Enemy } from '../classes/Enemy'
import { Player } from '../classes/Player'
import { type Socket } from 'socket.io-client'
import type { GameState } from '../../types/ServerTypes'
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
    private player!: Player;
    // enemies will be filled by the EnemySpawner
    private enemies: Enemy[] = [];
    private bubbles: Bubble[] = [];
    private socket!: Socket;
    private base?: Base;
    private otherPlayers: Map<string, Player> = new Map();
    private playername!: string;
    private enemyInterval: number = 5000;
    private enemyWaveCount: number = 5;


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

        this.cameras.main.setBounds(
            0,
            0,
            this.level1Map.widthInPixels,
            this.level1Map.heightInPixels
        )
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09)
        this.cameras.main.setZoom(1.5)

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
                    otherPlayer.label.setPosition(
                        playerInfo.x,
                        playerInfo.y + 120
                    )
                    otherPlayer.scaleX = playerInfo.direction
                }
            }
        )

        this.socket.emit('joinGame', { playerName: this.playername })

        const bubbleStart = [1200, 100];
        // Define the path
        const path = [
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
        ];

        const graphics = this.add.graphics()
        graphics.lineStyle(3, 0xffffff, 1)

        this.bubbles.push(new Bubble(this, bubbleStart, path));
        const enemySpawnPoints = [
            new Phaser.Math.Vector2(1200, 100),
            new Phaser.Math.Vector2(1200, 300),
            new Phaser.Math.Vector2(1200, 500),
            new Phaser.Math.Vector2(1200, 700),
        ];
        const enemySpawner = new EnemySpawner(this, enemySpawnPoints, this.enemyInterval, this.enemyWaveCount);
        enemySpawner.start();
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

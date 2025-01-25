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
		super("Level");

		/* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// level1Map
		const level1Map = this.add.tilemap("BubbleNautsMap");
		level1Map.addTilesetImage("Decoration", "decoration");
		level1Map.addTilesetImage("Bubbles", "bubbles");
		level1Map.addTilesetImage("Player", "player");
		level1Map.addTilesetImage("Environment", "environment");

		// ground_1
		level1Map.createLayer("Ground", ["Environment"], 0, 0);

		// walls_1
		level1Map.createLayer("Walls", ["Environment"], 0, 0);

		// floor_1
		level1Map.createLayer("Floor", ["Environment","Decoration"], 0, 0);

		// roadBottom_1
		level1Map.createLayer("RoadBottom", ["Decoration"], 0, 0);

		// roadTop_1
		level1Map.createLayer("RoadTop", ["Environment","Decoration"], 0, 0);

		// base_1
		level1Map.createLayer("Base", ["Environment","Decoration"], 0, 0);

		this.level1Map = level1Map;

		this.events.emit("scene-awake");
	}

	private level1Map!: Phaser.Tilemaps.Tilemap;

	/* START-USER-CODE */
    private player_1!: Player
    private enemy_1?: Enemy
    private socket!: Socket
    private path!: Phaser.Curves.Path
    private base?: Base
    private otherPlayers: Map<string, Phaser.GameObjects.Sprite> = new Map()

    create() {
        this.socket = this.registry.get('socket')
        console.log(this.socket)
        if (!this.socket) {
            console.error('No socket found in registry')
            this.scene.start('Menu')
            return
        }

        this.editorCreate()

        const obstacles = this.physics.add.staticGroup()
        obstacles.create(300, 300, 'guapen').setScale(0.3)

        // Pass socket to Player
        this.player_1 = new Player(this, 400, 300, this.socket)
        this.enemy_1 = new Enemy(this, 800, 600)
        this.base = new Base(this, 100, 100)

        // Vielleicht lager ich das in ein game.ts file aus
        this.socket.on('gameState', (gameState: GameState) => {
            // Clear existing players
            this.otherPlayers.forEach((player) => player.destroy())
            this.otherPlayers.clear()

            // Create sprites for other players
            Object.values(gameState.players).forEach((player) => {
                if (player.id !== this.socket.id) {
                    const otherPlayer = this.add.sprite(
                        player.x,
                        player.y,
                        'FufuSuperDino'
                    )
                    otherPlayer.setTint(0x00ff00) // Different color to distinguish other players
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
                flipX?: boolean
            }) => {
                const otherPlayer = this.otherPlayers.get(playerInfo.id)
                if (otherPlayer) {
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y)
                    if (playerInfo.flipX !== undefined) {
                        otherPlayer.setFlipX(playerInfo.flipX)
                    }
                }
            }
        )

        // Define the path
        this.path = this.add.path(1200, 100)
        this.path.lineTo(1200, 300)
        this.path.lineTo(800, 300)
        this.path.lineTo(800, 150)
        this.path.lineTo(1000, 150)
        this.path.lineTo(1000, 600)
        this.path.lineTo(600, 600)

        const graphics = this.add.graphics()
        graphics.lineStyle(1, 0xffffff, 1)
        this.path.draw(graphics)

        const enemy = new Enemy(this, 1200, 100)
        this.enemy_1 = this.add.follower(
            this.path,
            enemy.x,
            enemy.y,
            enemy.texture.key
        )
        this.enemy_1.startFollow({
            duration: 5000,
            yoyo: false,
            repeat: -1,
            rotateToPath: true,
        })
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        this.player_1.update(cursors, delta)
        this.base?.update(time, delta)
    }
}

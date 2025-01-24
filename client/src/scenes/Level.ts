// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {
    constructor() {
        super('Level')

        /* START-USER-CTR-CODE */
        console.log('asdfasdf')
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    editorCreate(): void {
        this.events.emit('scene-awake')
    }

    /* START-USER-CODE */
	private player_1?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
	private enemy_1?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
	private playerSpeed: number = 0.3;

    create() {
			this.editorCreate();
			this.createServerConnection();
	
			const obstacles = this.physics.add.staticGroup();
			obstacles.create(300, 300, 'guapen').setScale(0.3);
	
			const player = this.physics.add.staticSprite(100, 400, 'FufuSuperDino').setScale(0.3);
			this.physics.add.collider(player, obstacles);
			player.setTint(0x00ff00);
	
			this.player_1 = player;
	
			const enemy = this.physics.add.staticSprite(800, 600, 'FufuSuperDino').setScale(0.3);
			this.physics.add.collider(enemy, obstacles);
			enemy.setTint(0xff0000);
	
			this.enemy_1 = enemy;
    }

    update(time: number, delta: number): void {
        const cursors = this.input.keyboard.createCursorKeys()
        const speed = this.playerSpeed * delta

        if (cursors.left.isDown) {
            this.player_1.x = this.player_1.x - speed
        } else if (cursors.right.isDown) {
            this.player_1.x = this.player_1.x + speed
        } else if (cursors.up.isDown) {
            this.player_1.y = this.player_1.y - speed
        } else if (cursors.down.isDown) {
            this.player_1.y = this.player_1.y + speed
        }
    }

		createServerConnection() {
			let socket;
	
			if (location.hostname === 'localhost') {
				socket = new WebSocket('ws://localhost:9000');
			} else {
				socket = new WebSocket('ws://116.203.15.40:9000');
			}
	
			socket.addEventListener('close', (event) => {
				alert('Server is down, please (re)start the server + F5!');
			});
	
			socket.addEventListener('message', (event) => {
				let data = JSON.parse(event.data);
				console.log(data);
	
				//socket.send(JSON.stringify({ "type": "joinRoom", "roomId": roomId, "playerName": playerName }));
			});
		}
}

/* END OF COMPILED CODE */

// You can write more code here

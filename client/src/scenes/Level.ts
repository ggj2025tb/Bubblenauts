
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
		console.log("asdfasdf");
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// fufuSuperDino
		this.add.image(810, 233, "FufuSuperDino");

		// text
		const text = this.add.text(640, 458, "", {});
		text.setOrigin(0.5, 0.5);
		text.text = "Phaser 3 + Phaser Editor v4\nVite + TypeScript";
		text.setStyle({ "align": "center", "fontFamily": "Arial", "fontSize": "3em" });

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {
		console.log("asdfasdf");
		this.editorCreate();

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

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

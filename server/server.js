const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 9000 });

let game = {
    players: {}
};

wss.on("connection", function connection(ws) {
    ws.on("message", function (msg) {
        let obj = JSON.parse(msg);

        if (obj.type === 'joinGame') {
            game.players[obj.playerName] = {
                name: obj.playerName
            }
        }
        console.log(game);
    });
});

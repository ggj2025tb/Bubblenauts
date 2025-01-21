const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 9000 });

wss.on("connection", function connection(ws) {
    ws.on("message", function (msg) {
        let obj = JSON.parse(msg);
        console.log(obj);
    });
});

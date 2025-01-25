import { Server } from 'socket.io'
import { createServer } from 'http'
import { GameState, Player } from '../client/types/ServerTypes'
import { start } from 'repl'

const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

const gameState: GameState = {
    players: {},
    enemies: {},
    bubbles: {},
    mapData: {
        enemySpawnPoints: [],
        enemyPath: [],
        bubbleSpawnPoint: [],
        bubblePath: [],
    },
}

let enemyCounter = 0;
const enemySpawnInterval = 5000;

function spawnBubble() {
    const bubbleStart = [gameState.mapData.bubbleSpawnPoint[0], gameState.mapData.bubbleSpawnPoint[1]]
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
    ]
    const bubble = {
        id: 'bubble1',
        x: bubbleStart[0],
        y: bubbleStart[1],
        pathArray: path,
        health: 100,
    }
    // todo: add bubble to gameState
    gameState.bubbles[bubble.id] = bubble
    io.emit('bubbleCreated', bubble)
}

function startEnemySpawner() {
    setInterval(() => {
        enemyCounter++;
        // get x and y from gameState.enemySpawnPoints randomly
        console.log('Spawning enemy');
        const randomIndex = Math.floor(Math.random() * gameState.mapData.enemySpawnPoints.length);
        const randomSpawnPoint = gameState.mapData.enemySpawnPoints[randomIndex];
        const enemy = {
            id: 'enemy_' + enemyCounter,
            x: randomSpawnPoint[0],
            y: randomSpawnPoint[1],
            health: 100,
            pathArray: [
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
        gameState.enemies[enemy.id] = enemy
        io.emit('enemyCreated', enemy)
    }, enemySpawnInterval)
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('joinGame', ({ playerName }) => {
        const player: Player = {
            id: socket.id,
            name: playerName,
            x: 400,
            y: 300,
            health: 100,
        }

        // Add player to gameState
        gameState.players[socket.id] = player

        io.emit('gameState', gameState)
    })

    socket.on('playerUpdate', ({ x, y, direction }) => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].x = x
            gameState.players[socket.id].y = y
            gameState.players[socket.id].direction = direction
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x,
                y,
                direction,
            })
        }
    })

    socket.on('disconnect', () => {
        delete gameState.players[socket.id]
        io.emit('gameState', gameState)
    })

    socket.on('startGame', ({ mapData }) => {
        gameState.mapData.enemySpawnPoints = mapData.enemySpawnPoints;
        gameState.mapData.enemyPath = mapData.enemyPath;
        gameState.mapData.bubbleSpawnPoint = mapData.bubbleSpawnPoint;
        gameState.mapData.bubblePath = mapData.bubblePath;
        console.log('Starting game');
        spawnBubble();
        startEnemySpawner();
        io.emit('gameState', gameState)
    })
})

const PORT = process.env.PORT || 9000
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

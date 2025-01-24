import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        methods: ['GET', 'POST'],
    },
})

interface Player {
    id: string
    name: string
    x: number
    y: number
}

interface GameState {
    players: Record<string, Player>
}

const gameState: GameState = {
    players: {},
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('joinGame', ({ playerName }) => {
        const player: Player = {
            id: socket.id,
            name: playerName,
            x: 400,
            y: 300,
        }

        gameState.players[socket.id] = player
        io.emit('gameState', gameState)
        console.log('Player joined:', player)
    })

    socket.on('playerUpdate', ({ x, y }) => {
        console.log('playerUpdate')
        console.log('Player moved:', gameState.players[socket.id])
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].x = x
            gameState.players[socket.id].y = y
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x,
                y,
            })
        }
    })

    socket.on('disconnect', () => {
        delete gameState.players[socket.id]
        io.emit('gameState', gameState)
        console.log('Client disconnected:', socket.id)
    })
})

const PORT = process.env.PORT || 9000
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

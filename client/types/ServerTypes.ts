export interface Player {
    id: string
    name: string
    x: number
    y: number
    flipX?: boolean
    offset?: { x: number; y: number }
}

export interface GameState {
    players: Record<string, Player>
}

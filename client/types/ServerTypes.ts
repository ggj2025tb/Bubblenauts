export interface Player {
    id: string
    name: string
    x: number
    y: number
    direction?: number
    health: number
}

export interface GameState {
    players: Record<string, Player>
}

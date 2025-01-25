export interface Player {
    id: string
    name: string
    x: number
    y: number
    direction?: number
    health: number
    animation?: string
}

export interface Enemy {
    id: string
    x: number
    y: number
    health: number
    pathArray: number[][]
}

export interface Bubble {
    id: string
    x: number
    y: number
    health: number
    pathArray: number[][]
}

export interface MapData {
    enemySpawnPoints: number[][]
    enemyPath: number[][]
    bubbleSpawnPoint: number[]
    bubblePath: number[][]
}

export interface GameState {
    players: Record<string, Player>
    enemies: Record<string, Enemy>
    bubbles: Record<string, Bubble>
    mapData: MapData
}

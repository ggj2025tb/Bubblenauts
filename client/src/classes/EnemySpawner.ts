import Phaser from 'phaser';
import { Enemy } from './Enemy';

/**
 * A class that is used to spawn enemies at a certain interval.
 * It will have a function that is called via a callback from a timer, and should spawn continuously more enemies.
 */
export class EnemySpawner {
    private scene: Phaser.Scene;
    private timerEvent: Phaser.Time.TimerEvent;
    private spawnPoints: Phaser.Math.Vector2[] = [];
    private enemyStartCount: number = 5;
    private waveCount: number;
    private interval: number;

    constructor(
        scene: Phaser.Scene,
        spawnPoints: Phaser.Math.Vector2[],
        interval: number,
        waveCount: number,
    ) {
        this.scene = scene;
        this.spawnPoints = spawnPoints;
        this.waveCount = waveCount;
        this.interval = interval;
    }

    start(): void {
        this.timerEvent = this.scene.time.addEvent({
            delay: this.interval,
            callback: this.spawnNewEnemies,
            callbackScope: this,
            loop: true
        });
        this.timerEvent.paused = false;
    }

    spawnNewEnemies(): void {
        if (this.waveCount <= 0) {
            this.timerEvent.remove();
            return;
        }

        console.log('Spawning new enemies');

        // Spawns enemies at the random spawn points
        for (let i = 0; i < this.enemyStartCount; i++) {
            const spawnPoint = Phaser.Math.RND.pick(this.spawnPoints);
            console.log(`Spawning enemy at ${spawnPoint.x}, ${spawnPoint.y}`);
            let newEnemy = new Enemy(this.scene, spawnPoint.x, spawnPoint.y, this.scene.bubbles);
            this.scene.enemies.push(newEnemy);
        }

        this.waveCount--;
    }
}

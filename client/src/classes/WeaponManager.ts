import { Socket } from 'socket.io-client'
import { Weapon } from './Weapon'
import { Gun } from './Gun' // We'll create this new class

export class WeaponManager {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private weapons: Map<string, Weapon | Gun> = new Map()
    private currentWeapon: string = 'melee'

    constructor(
        scene: Phaser.Scene,
        player: Phaser.GameObjects.GameObject,
        socket: Socket
    ) {
        this.scene = scene
        this.player = player

        // Initialize both weapons
        this.weapons.set('melee', new Weapon(scene, player))
        this.weapons.set('gun', new Gun(scene, player, socket))

        // Setup weapon switching
        this.setupWeaponSwitching()
    }

    private setupWeaponSwitching() {
        // Weapon switching with number keys
        this.scene.input.keyboard.on('keydown-ONE', () =>
            this.switchToWeapon('melee')
        )
        this.scene.input.keyboard.on('keydown-TWO', () =>
            this.switchToWeapon('gun')
        )

        // Weapon switching with mouse wheel
        this.scene.input.mouse?.onMouseWheel((pointer, gameObjects, deltaX) => {
            if (deltaX > 0) {
                this.switchToNextWeapon()
            } else if (deltaX < 0) {
                this.switchToPreviousWeapon()
            }
        })
    }

    private switchToWeapon(weaponKey: string) {
        if (this.weapons.has(weaponKey)) {
            this.currentWeapon = weaponKey
        }
    }

    private switchToNextWeapon() {
        const weaponKeys = Array.from(this.weapons.keys())
        const currentIndex = weaponKeys.indexOf(this.currentWeapon)
        const nextIndex = (currentIndex + 1) % weaponKeys.length
        this.currentWeapon = weaponKeys[nextIndex]
    }

    private switchToPreviousWeapon() {
        const weaponKeys = Array.from(this.weapons.keys())
        const currentIndex = weaponKeys.indexOf(this.currentWeapon)
        const prevIndex =
            (currentIndex - 1 + weaponKeys.length) % weaponKeys.length
        this.currentWeapon = weaponKeys[prevIndex]
    }

    public getCurrentWeapon(): Weapon | Gun | undefined {
        return this.weapons.get(this.currentWeapon)
    }

    public update() {
        const currentWeapon = this.getCurrentWeapon()
        if (currentWeapon) {
            // You might want to add specific update logic here
        }
    }
}

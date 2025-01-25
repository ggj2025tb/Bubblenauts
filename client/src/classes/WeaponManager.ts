import { Socket } from 'socket.io-client'
import { Weapon } from './Weapon'
import { Gun } from './Gun'

export class WeaponManager {
    private scene: Phaser.Scene
    private player: Phaser.GameObjects.GameObject
    private socket: Socket
    private weapons: Map<string, Weapon | Gun> = new Map()
    private currentWeapon: string = 'melee'
    private mousePointer: Phaser.Input.Pointer
    private weaponIndicator: Phaser.GameObjects.Text
    private weaponSwitchText: Phaser.GameObjects.Text

    constructor(
        scene: Phaser.Scene,
        player: Phaser.GameObjects.GameObject,
        socket: Socket
    ) {
        this.scene = scene
        this.player = player
        this.socket = socket
        this.mousePointer = scene.input.activePointer

        // Initialize weapons with trident asset
        this.weapons.set(
            'melee',
            new Weapon(scene, player, this.mousePointer, 'Dreizack')
        )
        this.weapons.set(
            'gun',
            new Gun(scene, player, this.mousePointer, 'Dreizack')
        )

        // Weapon indicator
        this.weaponIndicator = scene.add
            .text(10, 10, 'Current Weapon: Melee', {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 5, y: 5 },
            })
            .setScrollFactor(0)
            .setDepth(1000)

        // Weapon switch instructions
        this.weaponSwitchText = scene.add
            .text(10, 40, 'Switch Weapons: 1/2', {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 5, y: 5 },
            })
            .setScrollFactor(0)
            .setDepth(1000)

        this.setupWeaponSwitching()
        this.setupAttackInput()
    }

    private setupWeaponSwitching() {
        this.scene.input.keyboard.on('keydown-ONE', () =>
            this.switchToWeapon('melee')
        )
        this.scene.input.keyboard.on('keydown-TWO', () =>
            this.switchToWeapon('gun')
        )
    }

    private setupAttackInput() {
        this.scene.input.on('pointerdown', this.attack, this)
    }

    private attack() {
        const currentWeapon = this.getCurrentWeapon()
        currentWeapon?.attack()
    }

    private switchToWeapon(weaponKey: string) {
        if (this.weapons.has(weaponKey)) {
            this.currentWeapon = weaponKey
            this.weaponIndicator.setText(
                `Current Weapon: ${weaponKey === 'melee' ? 'Melee' : 'Gun'}`
            )
        }
    }

    public getCurrentWeapon(): Weapon | Gun | undefined {
        return this.weapons.get(this.currentWeapon)
    }
}

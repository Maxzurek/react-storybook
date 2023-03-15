import Weapon from "./Weapon";

export default class TowerCrossbowWeapon extends Weapon {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
    }
}

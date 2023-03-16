import Weapon from "./Weapon";

export default class TowerCrossbowWeapon extends Weapon {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        const textureFrames = [0, 1, 2, 3, 4, 5];
        const reloadAnimationFrames = [2, 3, 4, 5, 0];

        super(textureFrames, reloadAnimationFrames, scene, x, y, texture, frame);
    }
}

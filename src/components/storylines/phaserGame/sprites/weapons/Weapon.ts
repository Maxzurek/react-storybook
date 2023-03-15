export default class Weapon extends Phaser.GameObjects.Sprite {
    #textureFrames = [0, 1, 2, 3, 4, 5];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.setScale(0.75, 0.75);
        this.originX = 0.275;
        this.setFrame(this.#textureFrames[0]);
    }
}

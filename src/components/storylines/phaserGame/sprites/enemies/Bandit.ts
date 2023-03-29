import Enemy from "./Enemy";

export class Bandit extends Enemy {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        const spriteTextureFrames = [4, 5, 6, 7];

        super(spriteTextureFrames, scene, x, y, texture, frame);

        this.health = 1000;
        this.maxHealth = 1000;
        this.speed = 100;
        this.goldValue = 1;
    }
}

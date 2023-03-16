import { animationKeys, textureKeys } from "../../Keys";
import MathUtils from "../../utils/Math.utils";

export default class Weapon extends Phaser.GameObjects.Sprite {
    protected textureFrames: number[];
    protected reloadAnimationFrames: number[];

    constructor(
        textureFrames: number[],
        reloadAnimationFrames: number[],
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.textureFrames = textureFrames;
        this.reloadAnimationFrames = reloadAnimationFrames;
        this.setScale(0.75, 0.75);
        this.originX = 0.275;
        this.setFrame(this.textureFrames[0]);
        this.#createAnimations();
    }

    fire() {
        this.anims.play(animationKeys.weapon.fire);
    }

    reload(time: number) {
        const frameRate = this.reloadAnimationFrames.length / MathUtils.millisecondsToSeconds(time);
        this.anims.play(
            {
                key: animationKeys.weapon.reload,
                frameRate,
            },
            true
        );
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.weapon.fire,
            frameRate: 1,
            frames: this.anims.generateFrameNumbers(textureKeys.weapons.crossbow, {
                frames: [this.textureFrames[2]],
            }),
            repeat: 0,
        });
        this.anims.create({
            key: animationKeys.weapon.reload,
            frames: this.anims.generateFrameNumbers(textureKeys.weapons.crossbow, {
                frames: this.reloadAnimationFrames,
            }),
            repeat: 0,
        });
    }
}

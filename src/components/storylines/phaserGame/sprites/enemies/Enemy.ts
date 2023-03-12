import { ArmorType, ResistanceType } from "../../interfaces/Sprite.interfaces";
import { animationKeys, textureKeys } from "../../Keys";
import Sprite, { MoveDirection } from "../Sprite";

export default class Enemy extends Sprite {
    protected health = 0;
    protected armor = 0;
    protected armorType: ArmorType = ArmorType.Light;
    protected resistanceType: ResistanceType = ResistanceType.None;

    constructor(
        spriteTextureFrames: number[],
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.spriteTextureFrames = spriteTextureFrames;
        this.setFrame(this.spriteTextureFrames[0]);
        this.#createAnimations();
        this.anims.play(animationKeys.enemy.idle);
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.enemy.idle,
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                frames: [this.spriteTextureFrames[1], this.spriteTextureFrames[3]],
            }),
            repeat: -1,
        });
        this.anims.create({
            key: animationKeys.enemy.walk,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                start: this.spriteTextureFrames[0],
                end: this.spriteTextureFrames[3],
            }),
            repeat: -1,
        });
    }

    animateSpriteMovement(moveDirection: MoveDirection): void {
        if (moveDirection === MoveDirection.Idle) {
            this.anims.play(animationKeys.enemy.idle, true);
        } else {
            this.anims.play(animationKeys.enemy.walk, true);
        }
    }
}

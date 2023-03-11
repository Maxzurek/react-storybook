import { ArmorType, ResistanceType } from "../../interfaces/Sprite.interfaces";
import { animationKeys, assetKeys } from "../../Keys";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    protected spriteTextureFrames: number[] = [];
    protected speed = 0;
    protected movePath: Phaser.Math.Vector2[] = [];
    protected moveToTarget: Phaser.Math.Vector2;
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

    update() {
        this.#moveIfNeeded();
    }

    moveAlong(path: Phaser.Math.Vector2[]) {
        if (!path || path.length <= 0) {
            return;
        }

        this.movePath = path;
        this.#moveTo(this.movePath.shift());
    }

    #moveTo(target: Phaser.Math.Vector2) {
        this.moveToTarget = target;
    }

    #moveIfNeeded() {
        const deltaOffset = 2;
        let deltaX = 0;
        let deltaY = 0;

        if (this.moveToTarget) {
            deltaX = this.moveToTarget.x - this.x;
            deltaY = this.moveToTarget.y - this.y;

            if (Math.abs(deltaX) < deltaOffset) {
                deltaX = 0;
            }
            if (Math.abs(deltaY) < deltaOffset) {
                deltaY = 0;
            }

            if (deltaX === 0 && deltaY === 0) {
                if (this.movePath.length > 0) {
                    this.#moveTo(this.movePath.shift());
                    return;
                }

                this.moveToTarget = null;
            }
        }

        const moveLeft = deltaX < 0;
        const moveRight = deltaX > 0;
        const moveUp = deltaY < 0;
        const moveDown = deltaY > 0;

        if (moveLeft) {
            this.anims.play(animationKeys.enemy.walk, true);
            this.setVelocity(-this.speed, 0);
            this.flipX = true;
        } else if (moveRight) {
            this.anims.play(animationKeys.enemy.walk, true);
            this.setVelocity(this.speed, 0);
            this.flipX = false;
        } else if (moveUp) {
            this.anims.play(animationKeys.enemy.walk, true);
            this.setVelocity(0, -this.speed);
        } else if (moveDown) {
            this.anims.play(animationKeys.enemy.walk, true);
            this.setVelocity(0, this.speed);
        } else {
            this.anims.play(animationKeys.enemy.idle, true);
            this.setVelocity(0, 0);
        }
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.enemy.idle,
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(assetKeys.sprites, {
                frames: [this.spriteTextureFrames[1], this.spriteTextureFrames[3]],
            }),
            repeat: -1,
        });
        this.anims.create({
            key: animationKeys.enemy.walk,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(assetKeys.sprites, {
                start: this.spriteTextureFrames[0],
                end: this.spriteTextureFrames[3],
            }),
            repeat: -1,
        });
    }
}

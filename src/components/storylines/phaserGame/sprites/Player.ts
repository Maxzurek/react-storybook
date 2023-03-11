import { animationKeys, assetKeys } from "../Keys";

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            player(
                x: number,
                y: number,
                texture: string | Phaser.Textures.Texture,
                frame?: string | number
            ): Player;
        }
    }
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
    #spriteTextureFrames = [124, 125, 126, 127];
    #speed = 200;
    #movePath: Phaser.Math.Vector2[] = [];
    #moveToTarget: Phaser.Math.Vector2 = undefined;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.#createAnimations();
        this.anims.play(animationKeys.player.idle);
    }

    update() {
        this.#movePlayerIfNeeded();
    }

    moveAlong(path: Phaser.Math.Vector2[]) {
        if (!path || path.length <= 0) {
            return;
        }

        this.#movePath = path;
        this.#moveTo(this.#movePath.shift());
    }

    #moveTo(target: Phaser.Math.Vector2) {
        this.#moveToTarget = target;
    }

    #movePlayerIfNeeded() {
        const deltaOffset = 2;
        let deltaX = 0;
        let deltaY = 0;

        if (this.#moveToTarget) {
            deltaX = this.#moveToTarget.x - this.x;
            deltaY = this.#moveToTarget.y - this.y;

            if (Math.abs(deltaX) < deltaOffset) {
                deltaX = 0;
            }
            if (Math.abs(deltaY) < deltaOffset) {
                deltaY = 0;
            }

            if (deltaX === 0 && deltaY === 0) {
                if (this.#movePath.length > 0) {
                    this.#moveTo(this.#movePath.shift());
                    return;
                }

                this.#moveToTarget = null;
            }
        }

        const moveLeft = deltaX < 0;
        const moveRight = deltaX > 0;
        const moveUp = deltaY < 0;
        const moveDown = deltaY > 0;

        if (moveLeft) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(-this.#speed, 0);
            this.flipX = true;
        } else if (moveRight) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(this.#speed, 0);
            this.flipX = false;
        } else if (moveUp) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(0, -this.#speed);
        } else if (moveDown) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(0, this.#speed);
        } else {
            this.anims.play(animationKeys.player.idle, true);
            this.setVelocity(0, 0);
        }
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.player.idle,
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(assetKeys.sprite.characters, {
                frames: [this.#spriteTextureFrames[1], this.#spriteTextureFrames[3]],
            }),
            repeat: -1,
        });
        this.anims.create({
            key: animationKeys.player.walk,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(assetKeys.sprite.characters, {
                start: this.#spriteTextureFrames[0],
                end: this.#spriteTextureFrames[3],
            }),
            repeat: -1,
        });
    }
}

Phaser.GameObjects.GameObjectFactory.register(
    "player",
    function (
        this: Phaser.GameObjects.GameObjectFactory,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
    ) {
        const sprite = new Player(this.scene, x, y, texture, frame);

        this.displayList.add(sprite);
        this.updateList.add(sprite);
        this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);

        return sprite;
    }
);

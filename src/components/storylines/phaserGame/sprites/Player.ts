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
    private movePath: Phaser.Math.Vector2[] = [];
    private moveToTarget: Phaser.Math.Vector2 = undefined;

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
        let dx = 0;
        let dy = 0;

        if (this.moveToTarget) {
            dx = this.moveToTarget.x - this.x;
            dy = this.moveToTarget.y - this.y;

            if (Math.abs(dx) < 2) {
                dx = 0;
            }
            if (Math.abs(dy) < 2) {
                dy = 0;
            }

            if (dx === 0 && dy === 0) {
                if (this.movePath.length > 0) {
                    this.moveTo(this.movePath.shift());
                    return;
                }

                this.moveToTarget = null;
            }
        }

        // this logic is the same except we determine
        // if a key is down based on dx and dy
        const leftDown = dx < 0;
        const rightDown = dx > 0;
        const upDown = dy < 0;
        const downDown = dy > 0;

        const speed = 200;

        if (leftDown) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(-speed, 0);
            this.flipX = true;
        } else if (rightDown) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(speed, 0);
            this.flipX = false;
        } else if (upDown) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(0, -speed);
        } else if (downDown) {
            this.anims.play(animationKeys.player.walk, true);
            this.setVelocity(0, speed);
        } else {
            this.anims.play(animationKeys.player.idle, true);
            this.setVelocity(0, 0);
        }
    }

    moveAlong(path: Phaser.Math.Vector2[]) {
        if (!path || path.length <= 0) {
            return;
        }

        this.movePath = path;
        this.moveTo(this.movePath.shift());
    }

    moveTo(target: Phaser.Math.Vector2) {
        this.moveToTarget = target;
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.player.idle,
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(assetKeys.sprite.characters, {
                frames: [125, 127],
            }), /// TODO replace keyframe number with var
            repeat: -1,
        });
        this.anims.create({
            key: animationKeys.player.walk,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(assetKeys.sprite.characters, {
                start: 124,
                end: 127,
            }), /// TODO replace keyframe number with var
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

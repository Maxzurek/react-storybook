import { animationKeys, textureKeys } from "../Keys";
import depthLevels from "../scenes/DepthLevels";
import Sprite, { MoveDirection } from "./Sprite";

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

export default class Player extends Sprite {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.spriteTextureFrames = [124, 125, 126, 127];
        this.speed = 200;
        this.setDepth(depthLevels.high);
        this.setFrame(this.spriteTextureFrames[124]);
        this.#createAnimations();
        this.anims.play(animationKeys.player.idle);
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.player.idle,
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                frames: [this.spriteTextureFrames[1], this.spriteTextureFrames[3]],
            }),
            repeat: -1,
        });
        this.anims.create({
            key: animationKeys.player.walk,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                start: this.spriteTextureFrames[0],
                end: this.spriteTextureFrames[3],
            }),
            repeat: -1,
        });
    }

    animateSpriteMovement(moveDirection: MoveDirection) {
        if (moveDirection === MoveDirection.Idle) {
            this.anims.play(animationKeys.player.idle, true);
        } else {
            this.anims.play(animationKeys.player.walk, true);
        }
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

import { animationKeys, textureKeys } from "../../Keys";
import depthLevels from "../../scenes/DepthLevels";
import MathUtils from "../../utils/Math.utils";
import Enemy from "../enemies/Enemy";
import Weapon from "../weapons/Weapon";

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    protected speed = 0;
    #animationFrames: number[];
    #weaponOwner: Weapon;
    #enemyTarget: Enemy;
    #targetWorldPosition: Phaser.Math.Vector2;

    constructor(
        animationFrames: number[],
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.scale = 0.75;
        this.#animationFrames = animationFrames;
        this.setDepth(depthLevels.medium);
        this.#createAnimations();
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.anims.currentFrame;
        if (!this.#targetWorldPosition) return;

        const targetOffset = 4;
        const deltaX = this.#targetWorldPosition.x - this.x;
        const deltaY = this.#targetWorldPosition.y - this.y;
        const isTargetReached = Math.abs(deltaX) < targetOffset && Math.abs(deltaY) < targetOffset;

        if (isTargetReached) {
            this.#targetWorldPosition = null;
            this.#weaponOwner.handleProjectileHit(this, this.#enemyTarget);
        }
    }

    launch(weaponOwner: Weapon, enemyTarget: Enemy) {
        this.#weaponOwner = weaponOwner;
        this.#enemyTarget = enemyTarget;

        const { velocity: enemyTargetVelocity } = enemyTarget.body;
        const thisWorldPosition = new Phaser.Math.Vector2(this.x, this.y);
        const targetDeltaVelocity = new Phaser.Math.Vector2(
            (enemyTargetVelocity.x * enemyTargetVelocity.x) / this.speed,
            (enemyTargetVelocity.y * enemyTargetVelocity.y) / this.speed
        );
        this.#targetWorldPosition = new Phaser.Math.Vector2(
            enemyTarget.x + targetDeltaVelocity.x,
            enemyTarget.y + targetDeltaVelocity.y
        );
        const angleDegree = MathUtils.getAngleDegreeBetween(
            thisWorldPosition,
            this.#targetWorldPosition
        );
        const velocityVector = MathUtils.getVelocityVectorFrom(
            thisWorldPosition,
            this.#targetWorldPosition,
            this.speed
        );

        // We add an offset to the angle because this sprite is pointing up at the 6 o'clock position
        const angleOffset = 90;
        this.setAngle(angleDegree + angleOffset);
        this.setVelocity(velocityVector.x, velocityVector.y);
        this.anims.play(animationKeys.projectile.launch, true);
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.projectile.launch,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(textureKeys.projectiles.crossbow, {
                frames: this.#animationFrames,
            }),
            repeat: -1,
        });
    }
}

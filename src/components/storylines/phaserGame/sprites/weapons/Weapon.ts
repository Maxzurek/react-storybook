import { animationKeys, textureKeys } from "../../Keys";
import MathUtils from "../../utils/Math.utils";
import Enemy from "../enemies/Enemy";
import Projectile from "../projectiles/Projectile";
import depthLevels from "../../scenes/DepthLevels";
import Tower from "../towers/Tower";
import { tiledMapConfig } from "../../configs/TiledConfig";

export default class Weapon extends Phaser.GameObjects.Sprite {
    protected textureFrames: number[];
    protected reloadAnimationFrames: number[];
    protected projectiles: Phaser.Physics.Arcade.Group;
    #target: Enemy;
    #towerOwner: Tower;

    constructor(
        towerOwner: Tower,
        textureFrames: number[],
        reloadAnimationFrames: number[],
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        const newX = x + tiledMapConfig.castle.tiles.width / 2;
        const scaleMultiplier = 1.5;

        super(scene, newX, y, texture, frame);

        scene.add.existing(this);
        this.textureFrames = textureFrames;
        this.reloadAnimationFrames = reloadAnimationFrames;
        this.#towerOwner = towerOwner;
        this.setScale(
            this.#towerOwner.scaleX * scaleMultiplier,
            this.#towerOwner.scaleY * scaleMultiplier
        );
        this.createProjectileGroup();
        this.#createAnimations();
        this.setDepth(depthLevels.medium);
    }

    update(time: number, delta: number): void {
        super.update(time, delta);

        if (!this.#target) return;

        this.#rotateTowardsTarget();
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);

        this.projectiles.clear(true, true);
    }

    fireAt(towerOwner: Tower, target: Enemy) {
        this.#towerOwner = towerOwner;
        this.#target = target;
        this.anims.play(animationKeys.weapon.fire);

        const projectile = this.projectiles.get(this.x, this.y) as Projectile;
        projectile.setDepth(this.depth);
        projectile.launch(this, target);
    }

    stopFiring() {
        this.#target = null;
        this.setAngle(0);
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

    handleProjectileHit(projectile: Projectile, target: Enemy) {
        this.projectiles.remove(projectile, true, true);
        this.#towerOwner.handleProjectileHit(target);
    }

    #rotateTowardsTarget() {
        const thisWorldPosition = new Phaser.Math.Vector2(this.x, this.y);
        const targetWorldPosition = new Phaser.Math.Vector2(this.#target.x, this.#target.y);
        const angleDegree = MathUtils.getAngleDegreeBetween(thisWorldPosition, targetWorldPosition);
        const angleOffset = 90;
        this.setAngle(angleDegree + angleOffset);
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

    createProjectileGroup() {
        const message = "Weapon - Abstract method 'createProjectileGroup' must be implemented.";
        console.log(message);
        throw new Error(message);
    }
}

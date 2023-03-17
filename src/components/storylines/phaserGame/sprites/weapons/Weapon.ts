import { animationKeys, textureKeys } from "../../Keys";
import MathUtils from "../../utils/Math.utils";
import Enemy from "../enemies/Enemy";
import Projectile from "../projectiles/Projectile";
import castleMap from "../../tiled/castleMap.json";
import depthLevels from "../../scenes/DepthLevels";
import Tower from "../towers/Tower";

export default class Weapon extends Phaser.GameObjects.Sprite {
    protected textureFrames: number[];
    protected reloadAnimationFrames: number[];
    protected projectiles: Phaser.Physics.Arcade.Group;
    #target: Enemy;
    #towerOwner: Tower;

    constructor(
        textureFrames: number[],
        reloadAnimationFrames: number[],
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        const newX = x + castleMap.tilewidth / 2;

        super(scene, newX, y, texture, frame);

        this.textureFrames = textureFrames;
        this.reloadAnimationFrames = reloadAnimationFrames;
        this.setScale(0.75, 0.75);
        this.setFrame(frame);
        this.createProjectileGroup();
        this.#createAnimations();
        this.setDepth(depthLevels.medium);
    }

    update(time: number, delta: number): void {
        super.update(time, delta);

        if (!this.#target) return;

        const worldPosition = new Phaser.Math.Vector2(this.x, this.y);
        const targetWorldPosition = new Phaser.Math.Vector2(this.#target.x, this.#target.y);
        const angleDegree = MathUtils.getAngleDegreeBetween(worldPosition, targetWorldPosition);
        const angleOffset = 90;
        this.setAngle(angleDegree + angleOffset);
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

import { DamageType, SpriteType, TowerType } from "../../interfaces/Sprite.interfaces";
import depthLevels from "../../scenes/DepthLevels";
import MathUtils from "../../utils/Math.utils";
import Enemy from "../enemies/Enemy";
import Weapon from "../weapons/Weapon";
import { tiledMapConfig } from "../../configs/TiledConfig";
import { animationKeys, textureKeys } from "../../Keys";

enum BuildStatus {
    NotBuild,
    BuildingInProgress,
    Complete,
}

export interface TowerInfo {
    name: string;
    goldCost: number;
    buildTime: number;
    damage: number;
    damageType: DamageType;
    attackDelay: number;
    range: number;
}

export default class Tower extends Phaser.GameObjects.Sprite {
    protected towerType: TowerType;
    protected info: TowerInfo = {
        name: "",
        goldCost: null,
        buildTime: null,
        damage: null,
        damageType: null,
        attackDelay: null,
        range: null,
    };
    protected weapon: Weapon;
    #buildStatus: BuildStatus = BuildStatus.NotBuild;
    #buildTimer = 0;
    #isAttackReady = true;
    #attackTimer = 0;
    #rangeIndicatorGameObject: Phaser.GameObjects.Arc;
    #closestEnemyInRange: Phaser.GameObjects.GameObject;
    #previousClosestEnemyInRange: Phaser.GameObjects.GameObject;
    #towerFrameLevelOne = 0;

    constructor(
        range: number,
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        const scale = 0.5;
        this.info.range = range;
        this.type = SpriteType.Tower;
        this.setDepth(depthLevels.low);
        this.setScale(scale, scale);
        this.originX = 0;
        this.setFrame(this.#towerFrameLevelOne);
        this.#addDebugRangeIndicator();
        this.#createAnimations();
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.#buildStatus === BuildStatus.NotBuild) {
            this.#addDebugRangeIndicator();
            return;
        }

        const isBuildingComplete = this.#buildTimer >= this.info.buildTime;
        if (this.#buildStatus === BuildStatus.BuildingInProgress && !isBuildingComplete) {
            this.#buildTimer += delta;
            return;
        }

        if (this.#buildStatus === BuildStatus.BuildingInProgress && isBuildingComplete) {
            this.endBuild();
        }

        if (!this.#isAttackReady) {
            this.#attackTimer += delta;

            if (this.#attackTimer >= this.info.attackDelay) {
                this.#isAttackReady = true;
                this.#attackTimer = 0;
            }
            return;
        }

        this.#findClosestEnemy();
        this.weapon.update(time, delta);
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);

        this.weapon?.destroy(true);
        this.#rangeIndicatorGameObject?.destroy(true);
    }

    getTowerType() {
        return this.towerType;
    }

    getGoldCost() {
        return this.info.goldCost;
    }

    getInfo() {
        return this.info;
    }

    startBuild(targetWorldPosition: Phaser.Math.Vector2) {
        this.#buildStatus = BuildStatus.BuildingInProgress;
        this.setAlpha(1);
        this.clearTint();
        this.setVisible(true);
        this.setPosition(targetWorldPosition.x, targetWorldPosition.y);
        this.anims.play(animationKeys.tower.buildingInProgress, true);
    }

    endBuild() {
        this.#buildStatus = BuildStatus.Complete;
        this.createWeapon();
        this.anims.play(animationKeys.tower.buildingDone);
    }

    handleProjectileHit(target: Enemy) {
        target.takeDamage(this.info.damage);
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.tower.buildingDone,
            frameRate: 1,
            frames: this.anims.generateFrameNumbers(this.texture.key, {
                frames: [this.#towerFrameLevelOne],
            }),
            repeat: 0,
        });
        this.anims.create({
            key: animationKeys.tower.buildingInProgress,
            frameRate: 24,
            frames: this.anims.generateFrameNumbers(textureKeys.towers.buildingInProgress, {
                start: 21,
                end: 14,
            }),
            repeat: -1,
            duration: this.info.buildTime,
        });
    }

    #addDebugRangeIndicator() {
        if (this.#rangeIndicatorGameObject) {
            this.#rangeIndicatorGameObject.destroy();
        }

        const x = this.x + tiledMapConfig.castle.tiles.width / 2;
        const y = this.y + tiledMapConfig.castle.tiles.width / 2;
        const color = 0x9afcfb;
        const fillAlpha = 0.1;
        this.#rangeIndicatorGameObject = this.scene.add.circle(
            x,
            y,
            this.info.range,
            color,
            fillAlpha
        );
        this.#rangeIndicatorGameObject.setVisible(this.visible);
    }

    #findClosestEnemy() {
        const enemies: Phaser.GameObjects.GameObject[] = [];
        this.#previousClosestEnemyInRange = this.#closestEnemyInRange;
        let smallestDistanceBetween = Infinity;
        let closestEnemy: Phaser.GameObjects.GameObject;

        this.scene.children.each((child) => {
            if (child.type === SpriteType.Enemy) {
                const enemy = child as Phaser.Physics.Arcade.Sprite;
                const enemyWorldPosition = new Phaser.Math.Vector2(enemy.x, enemy.y);
                const towerWorldPosition = new Phaser.Math.Vector2(
                    this.x + tiledMapConfig.castle.tiles.width / 2,
                    this.y + +tiledMapConfig.castle.tiles.width / 2
                );
                const distanceBetween = MathUtils.getDistanceBetween(
                    towerWorldPosition,
                    enemyWorldPosition
                );

                if (distanceBetween < smallestDistanceBetween) {
                    smallestDistanceBetween = distanceBetween;
                    closestEnemy = enemy;
                }
                enemies.push(child);
            }
        });

        this.#hidePreviousTowerTargetIfAny();

        const isClosestEnemyInRange = closestEnemy && smallestDistanceBetween <= this.info.range;
        if (isClosestEnemyInRange) {
            this.#closestEnemyInRange = closestEnemy;
            this.#attackClosestEnemy();
        } else {
            this.weapon.stopFiring();
            this.#closestEnemyInRange = null;
        }
    }

    #hidePreviousTowerTargetIfAny() {
        if (!this.#previousClosestEnemyInRange) return;

        const enemy = this.#previousClosestEnemyInRange as Enemy;
        enemy.setTowerTargetVisibility(false); // TODO Remove debug
        this.#previousClosestEnemyInRange = null;
    }

    #attackClosestEnemy() {
        const enemy = this.#closestEnemyInRange as Enemy;
        enemy.setTowerTargetVisibility(true); // TODO Remove debug
        this.#isAttackReady = false;

        this.weapon.fireAt(this, enemy);
        this.weapon.reload(this.info.attackDelay);
    }

    createWeapon() {
        const message = "Tower - Abstract method 'createWeapon' must be implemented.";
        console.log(message);
        throw new Error(message);
    }
}

import { DamageType, SpriteType, TowerType } from "../../interfaces/Sprite.interfaces";
import depthLevels from "../../scenes/DepthLevels";
import MathUtils from "../../utils/Math.utils";
import Enemy from "../enemies/Enemy";
import Weapon from "../weapons/Weapon";
import { tiledMapConfig } from "../../configs/TiledConfig";

enum BuildStatus {
    NotBuild,
    BuildingInProgress,
    Complete,
}

export default class Tower extends Phaser.GameObjects.Sprite {
    protected towerType: TowerType;
    protected damage = 0;
    protected damageType: DamageType;
    protected attackDelay = 0;
    protected range = 0;
    protected buildTime = 0;
    protected weapons: Phaser.GameObjects.Group;
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
        this.range = range;
        this.type = SpriteType.Tower;
        this.setDepth(depthLevels.low);
        this.setScale(scale, scale);
        this.originX = 0;
        this.setFrame(this.#towerFrameLevelOne);
        this.#addDebugRangeIndicator();
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.#buildStatus === BuildStatus.NotBuild) {
            this.#addDebugRangeIndicator();
            return;
        }

        const isBuildingComplete = this.#buildTimer >= this.buildTime;
        if (this.#buildStatus === BuildStatus.BuildingInProgress && !isBuildingComplete) {
            this.#buildTimer += delta;
            return;
        }

        if (this.#buildStatus === BuildStatus.BuildingInProgress && isBuildingComplete) {
            this.#buildStatus = BuildStatus.Complete;
        }

        if (!this.#isAttackReady) {
            this.#attackTimer += delta;

            if (this.#attackTimer >= this.attackDelay) {
                this.#isAttackReady = true;
                this.#attackTimer = 0;
            }
            return;
        }

        this.#findClosestEnemy();
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);

        this.weapons?.destroy(true);
        this.#rangeIndicatorGameObject?.destroy();
    }

    getTowerType() {
        return this.towerType;
    }

    build(targetWorldPosition: Phaser.Math.Vector2) {
        this.#buildStatus = BuildStatus.BuildingInProgress;
        this.setAlpha(1);
        this.clearTint();
        this.setVisible(true);
        this.setPosition(targetWorldPosition.x, targetWorldPosition.y);

        this.createWeapon();
    }

    handleProjectileHit(target: Enemy) {
        target.takeDamage(this.damage);
    }

    #addDebugRangeIndicator() {
        if (this.#rangeIndicatorGameObject) {
            this.#rangeIndicatorGameObject.destroy();
        }

        const x = this.x + tiledMapConfig.castle.tiles.width / 2;
        const y = this.y + tiledMapConfig.castle.tiles.width / 2;
        const color = 0x9afcfb;
        const fillAlpha = 0.1;
        this.#rangeIndicatorGameObject = this.scene.add.circle(x, y, this.range, color, fillAlpha);
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

        const isClosestEnemyInRange = closestEnemy && smallestDistanceBetween <= this.range;
        if (isClosestEnemyInRange) {
            this.#closestEnemyInRange = closestEnemy;
            this.#attackClosestEnemy();
        } else {
            const weapon = this.weapons.getChildren()[0] as Weapon;
            weapon.stopFiring();
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

        const weapon = this.weapons.getChildren()[0] as Weapon;
        weapon.fireAt(this, enemy);
        weapon.reload(this.attackDelay);
    }

    createWeapon() {
        const message = "Tower - Abstract method 'createWeapon' must be implemented.";
        console.log(message);
        throw new Error(message);
    }
}

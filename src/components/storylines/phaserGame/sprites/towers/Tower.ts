import { DamageType, SpriteType, TowerType } from "../../interfaces/Sprite.interfaces";
import { textureKeys } from "../../Keys";
import depthLevels from "../../scenes/DepthLevels";
import MathUtils from "../../utils/Math.utils";
import castleMap from "../../tiled/castleMap.json";
import Enemy from "../enemies/Enemy";
import TowerCrossbowWeapon from "../weapons/TowerCrossbowWeapon";

export default class Tower extends Phaser.GameObjects.Sprite {
    protected towerType: TowerType;
    protected damage = 0;
    protected damageType: DamageType;
    protected attackSpeed = 0;
    protected range = 0;
    protected buildTime = 0;
    #isAttackReady = true;
    #attackTimer = 0;
    #rangeIndicatorGameObject: Phaser.GameObjects.Arc;
    #closestEnemyInRange: Phaser.GameObjects.GameObject;
    #previousClosestEnemyInRange: Phaser.GameObjects.GameObject;
    #towerFrameLevelOne = 0;
    #towerFrameLevelTwo = 1;
    #towerFrameLevelThree = 2;

    constructor(
        range: number,
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.range = range;
        this.type = SpriteType.Tower;
        this.setDepth(depthLevels.low);
        this.setScale(0.5, 0.5);
        this.originX = 0;
        this.setFrame(this.#towerFrameLevelOne);
        this.#createWeapon();
        this.#addDebugRangeIndicator();
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (!this.#isAttackReady) {
            this.#attackTimer += delta;

            if (this.#attackTimer >= this.attackSpeed) {
                this.#isAttackReady = true;
                this.#attackTimer = 0;
            }
            return;
        }

        this.#findClosestEnemy();
    }

    destroy(): void {
        this.#rangeIndicatorGameObject?.destroy();
    }

    getTowerType() {
        return this.towerType;
    }

    #addDebugRangeIndicator() {
        const x = this.x + castleMap.tilewidth / 2;
        const y = this.y + castleMap.tilewidth / 2;
        const color = 0x9afcfb;
        const fillAlpha = 0.1;
        this.#rangeIndicatorGameObject = this.scene.add.circle(x, y, this.range, color, fillAlpha);
    }

    // TODO Move to child class
    #createWeapon() {
        // TODO Add level 2 and 3 weapons
        const weaponGroup = this.scene.add.group({
            runChildUpdate: true,
            classType: TowerCrossbowWeapon,
        });
        weaponGroup
            .get(this.x, this.y, textureKeys.weapons.crossbow.level1) // TODO do we really want to upgrade towers/weapons?
            .setDepth(this.depth + 1);
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
                    this.x + castleMap.tilewidth / 2,
                    this.y + +castleMap.tilewidth / 2
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
            this.#closestEnemyInRange = null;
        }
    }

    #hidePreviousTowerTargetIfAny() {
        if (!this.#previousClosestEnemyInRange) return;

        const enemy = this.#previousClosestEnemyInRange as Enemy;
        enemy.setTowerTargetVisibility(false);
        this.#previousClosestEnemyInRange = null;
    }

    #attackClosestEnemy() {
        // TODO Add Projectile + animations
        const enemy = this.#closestEnemyInRange as Enemy;
        enemy.setTowerTargetVisibility(true);
        enemy.takeDamage(this.damage);
        this.#isAttackReady = false;
    }
}

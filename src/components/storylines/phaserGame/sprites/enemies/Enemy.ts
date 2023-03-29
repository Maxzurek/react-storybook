import ComponentService from "../../components/ComponentService";
import TowerTargetComponent from "../../components/debug/TowerTargetComponent";
import LifeBarComponent from "../../components/ui/LifeBarComponent";
import { eventKeys, gameEvents } from "../../events/EventsCenter";
import { ArmorType, ResistanceType, SpriteType } from "../../interfaces/Sprite.interfaces";
import { animationKeys, layerKeys, mapKeys, textureKeys } from "../../Keys";
import Game from "../../scenes/Game";
import MathUtils from "../../utils/Math.utils";
import PathUtils, { PathConfig } from "../../utils/Path.utils";
import Brain from "../Brain";
import Sprite, { MoveDirection } from "../Sprite";

enum HealthState {
    Alive,
    Dead,
}

export default class Enemy extends Sprite {
    protected health = 0;
    protected maxHealth = 0;
    protected armor = 0;
    protected armorType: ArmorType = ArmorType.Light;
    protected resistanceType: ResistanceType = ResistanceType.None;
    protected goldValue: number;
    protected healthState = HealthState.Alive;
    #finalDestinationTilePosition = new Phaser.Math.Vector2(10, 16);
    #brain = new Brain(this);
    #components = new ComponentService();

    constructor(
        spriteTextureFrames: number[],
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.maxHealth = this.health;
        this.type = SpriteType.Enemy;
        this.spriteTextureFrames = spriteTextureFrames;
        this.#components.addComponent(this, new LifeBarComponent());
        this.#components.addComponent(this, new TowerTargetComponent());
        this.setFrame(this.spriteTextureFrames[0]);
        this.#createAnimations();
        this.anims.play(animationKeys.enemy.idle);
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.healthState === HealthState.Dead) {
            gameEvents.emit(eventKeys.from.enemy.died, this);
            this.destroy();
            return;
        }

        this.#brain.update(time, delta);
        this.#components.update(time, delta);
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);

        this.#components.destroy();
    }

    getSpeed() {
        return this.speed;
    }

    getGoldValue() {
        return this.goldValue;
    }

    setTowerTargetVisibility(isVisible: boolean) {
        const component = this.#components.findComponent(this, TowerTargetComponent);
        component?.setVisible(isVisible);
    }

    findPathAndMoveToFinalDestination(pathConfig: PathConfig) {
        this.pathState.config = pathConfig;
        this.pathState.finalTargetTilePosition = this.#finalDestinationTilePosition;
        this.#brain.setState(this.#findPath);
    }

    takeDamage(amount: number) {
        const newHealth = Math.max(0, this.health - amount);
        this.health = newHealth;

        if (this.health === 0) {
            this.healthState = HealthState.Dead;
        }

        const lifeBar = this.#components.findComponent(this, LifeBarComponent);
        const lifePercentageRemaining = this.health / this.maxHealth;
        lifeBar?.updateFillPercentage(lifePercentageRemaining);
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.enemy.idle,
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                frames: [this.spriteTextureFrames[1], this.spriteTextureFrames[3]],
            }),
            repeat: -1,
        });
        this.anims.create({
            key: animationKeys.enemy.walk,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                start: this.spriteTextureFrames[0],
                end: this.spriteTextureFrames[3],
            }),
            repeat: -1,
        });
    }

    #findPath() {
        const { walkableLayer, unWalkableLayers } = this.pathState.config;
        const startTile = walkableLayer.worldToTileXY(this.x, this.y);
        const path = PathUtils.findPath(startTile, this.#finalDestinationTilePosition, {
            walkableLayer,
            unWalkableLayers,
        });

        if (!path.length) {
            gameEvents.emit(
                eventKeys.to.uiScene.showAlert,
                "Enemy path blocked.",
                MathUtils.secondsToMilliseconds(5)
            );

            this.pathState.path = [];
            this.pathState.isPathBlocked = true;
            this.#brain.setState(this.#findPathToClosestTower);
        } else {
            const nextTargetWorldPosition = path.shift();

            this.pathState = {
                finalTargetTilePosition: this.#finalDestinationTilePosition,
                path,
                nextTargetWorldPosition,
                config: { ...this.pathState.config },
            };
            this.#brain.setState(this.#validatePathState);
        }
    }

    #findPathToClosestTower() {
        const { unWalkableLayers, walkableLayer } = this.pathState.config;
        const gameScene = this.scene as Game;
        const castleMap = gameScene.getMap(mapKeys.castle);
        const layerGroundEnemy = castleMap.getLayer(layerKeys.ground.enemy);
        const layerWallSide = castleMap.getLayer(layerKeys.wall.side);
        const enemyLayers = castleMap.getEnemyLayers();
        const spriteTilePosition = layerGroundEnemy.worldToTileXY(this.x, this.y);

        if (!this.pathState.path.length) {
            this.pathState.path = PathUtils.findPath(
                spriteTilePosition,
                this.#finalDestinationTilePosition,
                {
                    walkableLayer: enemyLayers.walkable,
                    unWalkableLayers: [layerWallSide],
                    stopPathInFrontOfTarget: true,
                }
            );
        }

        const closestTowerTilePosition = gameScene.findClosestTowerTilePositionAlong(
            this.pathState.path
        );
        const path = PathUtils.findPath(spriteTilePosition, closestTowerTilePosition, {
            walkableLayer,
            unWalkableLayers,
            stopPathInFrontOfTarget: true,
        });
        const pathFinalTargetWorldPosition = path.at(-1);
        const pathFinalTargetTilePosition = walkableLayer.worldToTileXY(
            pathFinalTargetWorldPosition.x,
            pathFinalTargetWorldPosition.y
        );
        const nextTargetWorldPosition = path.shift();

        this.pathState = {
            ...this.pathState,
            path,
            finalTargetTilePosition: pathFinalTargetTilePosition,
            nextTargetWorldPosition,
            closestTowerTilePosition,
        };
        this.#brain.setState(this.#validatePathState);
    }

    #moveAlongPath() {
        this.moveSpiteAlongPath();
        this.#brain.setState(this.#validatePathState);
    }

    #validatePathState() {
        const { path, isPathBlocked } = this.pathState;
        const gameScene = this.scene as Game;
        const isPathBlockedByTower = !!gameScene.findClosestTowerTilePositionAlong(path);
        const isPathFinalDestinationReached = this.isPathFinalDestinationReached();

        if (isPathBlockedByTower) {
            this.#brain.setState(this.#findPath);
        } else if (isPathFinalDestinationReached && isPathBlocked) {
            gameEvents.emit(
                eventKeys.from.enemy.destroyTowerAt,
                this.pathState.closestTowerTilePosition
            );
            this.pathState.finalTargetTilePosition = this.#finalDestinationTilePosition;
            this.#brain.setState(this.#findPath);
        } else if (isPathFinalDestinationReached) {
            this.destroy();
            gameEvents.emit(eventKeys.from.enemy.finalDestinationReached);
        } else {
            this.#brain.setState(this.#moveAlongPath);
        }
    }

    animateSpriteMovement(moveDirection: MoveDirection): void {
        if (moveDirection === MoveDirection.Idle) {
            this.anims.play(animationKeys.enemy.idle, true);
        } else {
            this.anims.play(animationKeys.enemy.walk, true);
        }
    }
}

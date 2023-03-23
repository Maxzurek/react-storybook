import { textureKeys, sceneKeys, layerKeys } from "../Keys";
import "../sprites/Player";
import "../sprites/enemies/Enemy";
import Player from "../sprites/Player";
import EnemyWavesManager from "../managers/EnemyWavesManager";
import Ui from "./Ui";
import CastleMap from "../maps/CastleMap";
import { eventKeys, gameEvents } from "../events/EventsCenter";
import { EnemyType, TowerType } from "../interfaces/Sprite.interfaces";
import { Bandit } from "../sprites/enemies/Bandit";
import Tower from "../sprites/towers/Tower";
import Enemy from "../sprites/enemies/Enemy";
import TowerCrossbow from "../sprites/towers/TowerCrossbow";
import { debugColors } from "../Colors";
import MathUtils from "../utils/Math.utils";
import ResourceManager from "../managers/ResourceManager";
import PathUtils from "../utils/Path.utils";

enum BuildModeStatus {
    On,
    Off,
    AwaitingPlayerToBuild,
}

interface BuildMode {
    status: BuildModeStatus;
    tower: Tower;
    targetTilePosition?: Phaser.Math.Vector2;
}

interface SpriteLayers {
    walkable: Phaser.Tilemaps.TilemapLayer;
    unWalkable: Phaser.Tilemaps.TilemapLayer[];
}

export default class Game extends Phaser.Scene {
    constructor() {
        super(sceneKeys.game);
    }

    #uiScene: Ui;
    #player: Player;
    #castleMap: CastleMap;
    #enemyWavesManager: EnemyWavesManager;
    #resourceManager: ResourceManager;
    #enemyGroupsByType: Map<EnemyType, Phaser.Physics.Arcade.Group> = new Map();
    #towerGroupsByType: Map<TowerType, Phaser.GameObjects.Group> = new Map();
    #previousTargetTilePosition: Phaser.Math.Vector2;
    #buildMode: BuildMode = { status: BuildModeStatus.Off, tower: null, targetTilePosition: null };
    #playerLayers: SpriteLayers;
    #enemyLayers: SpriteLayers;

    init() {
        this.#initEventHandlers();
    }

    create() {
        this.#castleMap = new CastleMap(this);
        this.#createPlayer();
        this.#createEnemyGroups();
        this.#createTowerGroups();
        this.#createUiScene();
        this.#enemyWavesManager = new EnemyWavesManager(this);
        this.#resourceManager = new ResourceManager(this);

        this.#playerLayers = {
            walkable: this.#castleMap.getLayer(layerKeys.ground.player),
            unWalkable: [
                this.#castleMap.getLayer(layerKeys.wall.side),
                this.#castleMap.getLayer(layerKeys.wall.top),
                this.#castleMap.getLayer(layerKeys.props),
            ],
        };
        this.#enemyLayers = {
            walkable: this.#castleMap.getLayer(layerKeys.ground.enemy),
            unWalkable: [
                this.#castleMap.getLayer(layerKeys.wall.side),
                this.#castleMap.getLayer(layerKeys.tower.built),
            ],
        };
    }

    update(time: number, delta: number) {
        this.#player?.update(time, delta);
        this.#enemyWavesManager?.update(time, delta);
    }

    #createUiScene() {
        if (this.scene.get(sceneKeys.ui)) return;

        this.#uiScene = new Ui();
        this.game.scene.add(sceneKeys.ui, this.#uiScene, true);
        gameEvents.emit(eventKeys.from.gameScene.setTargetFrame, Player);
    }

    #createPlayer() {
        const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
        const startingTile = new Phaser.Math.Vector2(10, 8);
        const startingPosition = layerGroundPlayer.tileToWorldXY(startingTile.x, startingTile.y);
        startingPosition.x += layerGroundPlayer.tilemap.tileWidth / 2;
        startingPosition.y += layerGroundPlayer.tilemap.tileHeight / 2;

        this.#player = this.add.player(startingPosition.x, startingPosition.y, textureKeys.sprites);
    }

    #createEnemyGroups() {
        const bandits = this.physics.add.group({ runChildUpdate: true, classType: Bandit });
        this.#enemyGroupsByType.set(EnemyType.Bandit, bandits);
    }

    #createTowerGroups() {
        const crossbowTowers = this.add.group({
            runChildUpdate: true,
            classType: TowerCrossbow,
        });
        this.#towerGroupsByType.set(TowerType.Crossbow, crossbowTowers);
    }

    #destroyGameObjects() {
        for (const [_, enemies] of this.#enemyGroupsByType.entries()) {
            enemies.destroy(true);
        }
        for (const [_, towers] of this.#towerGroupsByType.entries()) {
            towers.destroy(true);
        }
        this.#player.destroy();
    }

    #deactivateBuildMode() {
        this.#buildMode = { status: BuildModeStatus.Off, tower: null, targetTilePosition: null };
    }

    #movePlayerToBuildTower(targetTilePosition: Phaser.Math.Vector2) {
        const layerTowerBuildable = this.#castleMap.getLayer(layerKeys.tower.buildable);
        if (!layerTowerBuildable.hasTileAt(targetTilePosition.x, targetTilePosition.y)) {
            return;
        }

        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        if (layerTowerBuilt.hasTileAt(targetTilePosition.x, targetTilePosition.y)) {
            return;
        }

        const playerWorldPosition = new Phaser.Math.Vector2(this.#player.x, this.#player.y);
        const layerPlayerGround = this.#castleMap.getLayer(layerKeys.ground.player);
        const playerTilePosition = layerPlayerGround.worldToTileXY(
            playerWorldPosition.x,
            playerWorldPosition.y
        );
        const isPlayerAlreadyAtTargetTilePosition =
            MathUtils.getDistanceBetween(playerTilePosition, targetTilePosition) === 0;

        if (isPlayerAlreadyAtTargetTilePosition) {
            this.#buildMode.targetTilePosition = targetTilePosition;
            this.#buildTower();
        } else {
            this.#buildMode.targetTilePosition = targetTilePosition;
            this.#buildMode.status = BuildModeStatus.AwaitingPlayerToBuild;
            this.#player.resetPath();
            this.#player.findPathAndMoveTo(targetTilePosition, {
                walkableLayer: this.#playerLayers.walkable,
                unWalkableLayers: this.#playerLayers.unWalkable,
                stopPathInFrontOfTarget: true,
            });
        }
    }

    #buildTower() {
        const { targetTilePosition } = this.#buildMode;
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        const { tower } = this.#buildMode;
        const tileTextureIndex = 17;

        const targetWorldPosition = layerTowerBuilt.tileToWorldXY(
            targetTilePosition.x,
            targetTilePosition.y
        );
        tower.startBuild(targetWorldPosition);
        layerTowerBuilt.putTileAt(tileTextureIndex, targetTilePosition.x, targetTilePosition.y);
        gameEvents.emit(eventKeys.from.gameScene.towerAdded, tower);
        this.#deactivateBuildMode();
    }

    #destroyTowerAt(towerWorldPosition: Phaser.Math.Vector2) {
        for (const [, towerGroup] of this.#towerGroupsByType.entries()) {
            for (const gameObject of towerGroup.getChildren()) {
                const tower = gameObject as Tower;

                if (tower.x === towerWorldPosition.x && tower.y === towerWorldPosition.y) {
                    const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
                    const towerTilePosition = layerTowerBuilt.worldToTileXY(tower.x, tower.y);

                    towerGroup.remove(tower, true, true);
                    layerTowerBuilt.removeTileAt(towerTilePosition.x, towerTilePosition.y);

                    return;
                }
            }
        }
    }

    #addTargetTile(targetTilePosition: Phaser.Math.Vector2) {
        const layerGroundInteractive = this.#castleMap.getLayer(layerKeys.ground.interactive);
        layerGroundInteractive.putTileAt(586, targetTilePosition.x, targetTilePosition.y);

        this.#previousTargetTilePosition = targetTilePosition;
    }

    #removePreviousTargetTile() {
        const layerGroundInteractive = this.#castleMap.getLayer(layerKeys.ground.interactive);

        layerGroundInteractive.putTileAt(
            588,
            this.#previousTargetTilePosition.x,
            this.#previousTargetTilePosition.y
        );
    }

    #findClosestTowerTilePositionAlong(path: Phaser.Math.Vector2[]) {
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);

        for (const position of path) {
            if (layerTowerBuilt.hasTileAtWorldXY(position.x, position.y)) {
                return layerTowerBuilt.worldToTileXY(position.x, position.y);
            }
        }
    }

    #initEventHandlers() {
        //Input events
        this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
        // Game events
        gameEvents.on(eventKeys.from.enemyWaveManager.spawnEnemy, this.#handleSpawnEnemy, this);
        gameEvents.on(eventKeys.from.uiScene.buildTower, this.#handleActivateBuildMode, this);
        gameEvents.on(eventKeys.from.player.pathChanged, this.#handlePlayerPathChanged, this);
        gameEvents.on(
            eventKeys.from.player.pathFinalDestinationReached,
            this.#handlePlayerPathFinalDestinationReached,
            this
        );
        gameEvents.on(eventKeys.from.enemy.pathBlocked, this.#handleSpritePathBlocked, this);
        gameEvents.on(
            eventKeys.from.resourceManager.noLivesRemaining,
            this.#handleNoLivesRemaining,
            this
        );
        gameEvents.on(eventKeys.from.enemy.destroyTowerAt, this.#handleEnemyDestroyTowerAt, this);
        // Remove events on scene shutdown
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#destroyGameObjects();
            this.input.off(Phaser.Input.Events.POINTER_UP);
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
            gameEvents.off(eventKeys.from.enemyWaveManager.spawnEnemy);
            gameEvents.off(eventKeys.from.uiScene.buildTower);
            gameEvents.off(eventKeys.from.player.pathChanged);
            gameEvents.off(eventKeys.from.player.pathFinalDestinationReached);
            gameEvents.off(eventKeys.from.enemy.pathBlocked);
            gameEvents.off(eventKeys.from.resourceManager.noLivesRemaining);
        });
    }

    #handlePointerUp(pointer: Phaser.Input.Pointer) {
        const { worldX, worldY } = pointer;
        const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
        const targetTilePosition = layerGroundPlayer.worldToTileXY(worldX, worldY);

        if (this.#buildMode.status === BuildModeStatus.On) {
            this.#movePlayerToBuildTower(targetTilePosition);
            return;
        }

        if (layerGroundPlayer.hasTileAtWorldXY(worldX, worldY)) {
            this.#player.findPathAndMoveTo(targetTilePosition, {
                walkableLayer: this.#playerLayers.walkable,
                unWalkableLayers: this.#playerLayers.unWalkable,
            });
        }
    }

    #handlePointerMove(pointer: Phaser.Input.Pointer) {
        if (this.#buildMode.status === BuildModeStatus.On) {
            this.#handlePointerMoveBuildModeOn(pointer);
        }
    }

    #handlePointerMoveBuildModeOn(pointer: Phaser.Input.Pointer) {
        const { tower } = this.#buildMode;
        const { worldX, worldY } = pointer;
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        const layerTowerBuildable = this.#castleMap.getLayer(layerKeys.tower.buildable);
        const targetTilePosition = layerTowerBuildable.worldToTileXY(worldX, worldY);
        const targetTileWorldPosition = layerTowerBuildable.tileToWorldXY(
            targetTilePosition.x,
            targetTilePosition.y
        );
        const isHoveringABuildableTile = layerTowerBuildable.hasTileAt(
            targetTilePosition.x,
            targetTilePosition.y
        );
        const isHoveringABuiltTower = layerTowerBuilt.hasTileAt(
            targetTilePosition.x,
            targetTilePosition.y
        );

        if (isHoveringABuildableTile || isHoveringABuiltTower) {
            tower.setVisible(true);
            tower.setPosition(targetTileWorldPosition.x, targetTileWorldPosition.y);
        }

        if (isHoveringABuildableTile) {
            tower.clearTint();
        } else {
            tower.setVisible(false);
        }

        if (isHoveringABuiltTower) {
            tower.setTint(debugColors.red.hex);
        }
    }

    #handleSpawnEnemy() {
        const startingTilePosition = new Phaser.Math.Vector2(10, 0);
        const targetTilePosition = this.#castleMap.getEnemyFinalDestinationTilePosition();
        const layerGroundEnemy = this.#castleMap.getLayer(layerKeys.ground.enemy);
        const enemyStartingWorldPosition = layerGroundEnemy.tileToWorldXY(
            startingTilePosition.x,
            startingTilePosition.y
        );
        enemyStartingWorldPosition.x += layerGroundEnemy.tilemap.tileWidth / 2;
        enemyStartingWorldPosition.y += layerGroundEnemy.tilemap.tileHeight / 2;

        const enemy: Enemy = this.#enemyGroupsByType
            .get(EnemyType.Bandit) // TODO replace with currentWaveState.enemyType
            .get(enemyStartingWorldPosition.x, enemyStartingWorldPosition.y, textureKeys.sprites);

        enemy.findPathAndMoveTo(targetTilePosition, {
            walkableLayer: this.#enemyLayers.walkable,
            unWalkableLayers: this.#enemyLayers.unWalkable,
        });
    }

    #handleActivateBuildMode(towerType: TowerType) {
        if (this.#buildMode.status !== BuildModeStatus.Off) return;

        const pointerPosition = new Phaser.Math.Vector2(this.input.x, this.input.y);
        const towerGroup = this.#towerGroupsByType.get(towerType);
        const tower = (towerGroup.get(pointerPosition.x, pointerPosition.y) as Tower)
            .setAlpha(0.5)
            .setVisible(false);
        const newBuildMode: BuildMode = { status: BuildModeStatus.On, tower };

        this.#buildMode = newBuildMode;
    }

    #handlePlayerPathFinalDestinationReached() {
        if (this.#buildMode.status === BuildModeStatus.AwaitingPlayerToBuild) {
            this.#buildTower();
        }
    }

    #handlePlayerPathChanged() {
        if (this.#buildMode.status === BuildModeStatus.AwaitingPlayerToBuild) {
            this.#buildMode.tower.destroy();
            this.#deactivateBuildMode();
        }
    }

    #handleSpritePathBlocked(sprite: Enemy, path: Phaser.Math.Vector2[]) {
        gameEvents.emit(
            eventKeys.from.gameScene.showAlert,
            "Enemy path blocked.",
            MathUtils.secondsToMilliseconds(5)
        );

        const layerGroundEnemy = this.#castleMap.getLayer(layerKeys.ground.enemy);
        const layerWallSide = this.#castleMap.getLayer(layerKeys.wall.side);
        const spriteTilePosition = layerGroundEnemy.worldToTileXY(sprite.x, sprite.y);
        const targetTilePosition = this.#castleMap.getEnemyFinalDestinationTilePosition();
        let pathCopy = [...path];

        if (!path.length) {
            pathCopy = PathUtils.findPath(spriteTilePosition, targetTilePosition, {
                walkableLayer: this.#enemyLayers.walkable,
                unWalkableLayers: [layerWallSide],
                stopPathInFrontOfTarget: true,
            });
        }

        const closestTowerTilePosition = this.#findClosestTowerTilePositionAlong(pathCopy);
        sprite.findPathMoveToAndDestroyTower(closestTowerTilePosition, {
            walkableLayer: this.#enemyLayers.walkable,
            unWalkableLayers: this.#enemyLayers.unWalkable,
        });
    }

    #handleNoLivesRemaining() {
        gameEvents.emit(eventKeys.from.gameScene.showAlert, "Game over", -1);
        this.#enemyWavesManager.endWaves();
    }

    #handleEnemyDestroyTowerAt(enemy: Enemy, towerTilePosition: Phaser.Math.Vector2) {
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);

        if (layerTowerBuilt.hasTileAt(towerTilePosition.x, towerTilePosition.y)) {
            const towerWorldPosition = layerTowerBuilt.tileToWorldXY(
                towerTilePosition.x,
                towerTilePosition.y
            );
            this.#destroyTowerAt(towerWorldPosition);
        }

        enemy.findPathAndMoveTo(this.#castleMap.getEnemyFinalDestinationTilePosition(), {
            walkableLayer: this.#enemyLayers.walkable,
            unWalkableLayers: this.#enemyLayers.unWalkable,
        });
    }
}

import { textureKeys, sceneKeys, layerKeys, mapKeys } from "../Keys";
import "../sprites/Player";
import "../sprites/enemies/Enemy";
import Player from "../sprites/Player";
import EnemyWavesManager from "../managers/EnemyWavesManager";
import Ui from "./Ui";
import CastleMap from "../maps/CastleMap";
import { eventKeys, gameEvents } from "../events/EventsCenter";
import { EnemyType } from "../interfaces/Sprite.interfaces";
import { Bandit } from "../sprites/enemies/Bandit";
import Enemy from "../sprites/enemies/Enemy";
import ResourceManager from "../managers/ResourceManager";
import BuildManager from "../managers/BuildManager";

export default class Game extends Phaser.Scene {
    constructor() {
        super(sceneKeys.game);
    }

    #uiScene: Ui;
    #player: Player;
    #castleMap: CastleMap;
    #enemyWavesManager: EnemyWavesManager;
    #resourceManager: ResourceManager;
    #buildManager: BuildManager;
    #enemyGroupsByType: Map<EnemyType, Phaser.Physics.Arcade.Group> = new Map();
    #previousTargetTilePosition: Phaser.Math.Vector2;

    init() {
        this.#initEventHandlers();
    }

    create() {
        this.#castleMap = new CastleMap(this);
        this.#createPlayer();
        this.#createEnemyGroups();
        this.#resourceManager = new ResourceManager(this);
        this.#createUiScene();
        this.#enemyWavesManager = new EnemyWavesManager(this);
        this.#buildManager = new BuildManager(this, this.#castleMap, this.#player);
    }

    update(time: number, delta: number) {
        this.#player?.update(time, delta);
        this.#enemyWavesManager?.update(time, delta);
    }

    getMap(key: string) {
        switch (key) {
            case mapKeys.castle:
                return this.#castleMap;
        }
    }

    #createUiScene() {
        if (this.scene.get(sceneKeys.ui)) return;

        this.#uiScene = new Ui(this.#resourceManager);
        this.game.scene.add(sceneKeys.ui, this.#uiScene, true);
        gameEvents.emit(eventKeys.to.uiScene.setTargetFrame, Player);
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

    #destroyGameObjects() {
        for (const [_, enemies] of this.#enemyGroupsByType.entries()) {
            enemies.destroy(true);
        }
        this.#buildManager.destroy();
        this.#player.destroy();
    }

    #addTargetTile(targetTilePosition: Phaser.Math.Vector2) {
        const layerGroundInteractive = this.#castleMap.getLayer(layerKeys.ground.interactive);
        layerGroundInteractive.putTileAt(586, targetTilePosition.x, targetTilePosition.y);

        this.#previousTargetTilePosition = targetTilePosition;
    }

    #removePreviousTargetTile() {
        if (!this.#previousTargetTilePosition) return;

        const layerGroundInteractive = this.#castleMap.getLayer(layerKeys.ground.interactive);

        layerGroundInteractive.putTileAt(
            588,
            this.#previousTargetTilePosition.x,
            this.#previousTargetTilePosition.y
        );
        this.#previousTargetTilePosition = null;
    }

    findClosestTowerTilePositionAlong(path: Phaser.Math.Vector2[]) {
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);

        for (const position of path) {
            if (layerTowerBuilt.hasTileAtWorldXY(position.x, position.y)) {
                return layerTowerBuilt.worldToTileXY(position.x, position.y);
            }
        }

        return null;
    }

    #initEventHandlers() {
        //Input events
        this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
        // Game events
        gameEvents.on(eventKeys.from.enemyWaveManager.spawnEnemy, this.#handleSpawnEnemy, this);
        gameEvents.on(
            eventKeys.from.resourceManager.noLivesRemaining,
            this.#handleNoLivesRemaining,
            this
        );
        gameEvents.on(
            eventKeys.from.uiScene.activateBuildMode,
            this.#handleActivateBuildMode,
            this
        );
        // Remove events on scene shutdown
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#destroyGameObjects();
            this.input.off(Phaser.Input.Events.POINTER_UP);
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
            gameEvents.off(eventKeys.from.enemyWaveManager.spawnEnemy);
            gameEvents.off(eventKeys.from.resourceManager.noLivesRemaining);
        });
    }

    #handlePointerUp(pointer: Phaser.Input.Pointer) {
        const { worldX, worldY } = pointer;
        const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
        const targetTilePosition = layerGroundPlayer.worldToTileXY(worldX, worldY);

        if (this.#buildManager.isBuildModeOn()) {
            this.#buildManager.movePlayerToBuildTower(targetTilePosition);
            return;
        }

        if (layerGroundPlayer.hasTileAtWorldXY(worldX, worldY)) {
            const playerLayers = this.#castleMap.getPlayerLayers();

            this.#player.findPathAndMoveTo(targetTilePosition, {
                walkableLayer: playerLayers.walkable,
                unWalkableLayers: playerLayers.unWalkable,
            });
        }
    }

    #handlePointerMove(pointer: Phaser.Input.Pointer) {
        const { worldX, worldY } = pointer;
        if (this.#buildManager.isBuildModeOn()) {
            const pointerWorldPosition = new Phaser.Math.Vector2(worldX, worldY);
            const layerPlayerWalkable = this.#castleMap.getPlayerLayers().walkable;
            const targetTilePosition = layerPlayerWalkable.worldToTileXY(worldX, worldY);

            this.#buildManager.updateTowerGhostPreview(pointerWorldPosition);
            this.#removePreviousTargetTile();
            this.#addTargetTile(targetTilePosition);

            return;
        }

        this.#removePreviousTargetTile();
    }

    #handleSpawnEnemy() {
        const startingTilePosition = new Phaser.Math.Vector2(10, 0);
        const layerGroundEnemy = this.#castleMap.getLayer(layerKeys.ground.enemy);
        const enemyLayers = this.#castleMap.getEnemyLayers();
        const enemyStartingWorldPosition = layerGroundEnemy.tileToWorldXY(
            startingTilePosition.x,
            startingTilePosition.y
        );
        enemyStartingWorldPosition.x += layerGroundEnemy.tilemap.tileWidth / 2;
        enemyStartingWorldPosition.y += layerGroundEnemy.tilemap.tileHeight / 2;

        const enemy: Enemy = this.#enemyGroupsByType
            .get(EnemyType.Bandit) // TODO replace with currentWaveState.enemyType
            .get(enemyStartingWorldPosition.x, enemyStartingWorldPosition.y, textureKeys.sprites);

        enemy.findPathAndMoveToFinalDestination({
            walkableLayer: enemyLayers.walkable,
            unWalkableLayers: enemyLayers.unWalkable,
        });
    }

    #handleNoLivesRemaining() {
        gameEvents.emit(eventKeys.to.uiScene.showAlert, "Game over", -1);
        this.#enemyWavesManager.endWaves();
    }

    #handleActivateBuildMode() {
        const { x: pointerWorldX, y: pointerWorldY } = this.input;
        const layerTowerBuildable = this.#castleMap.getLayer(layerKeys.tower.buildable);
        const pointerTilePosition = layerTowerBuildable.worldToTileXY(pointerWorldX, pointerWorldY);

        this.#addTargetTile(pointerTilePosition);
    }
}

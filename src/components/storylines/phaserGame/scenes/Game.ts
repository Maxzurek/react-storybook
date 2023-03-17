import { textureKeys, sceneKeys, layerKeys } from "../Keys";
import "../sprites/Player";
import "../sprites/enemies/Enemy";
import Player from "../sprites/Player";
import EnemyWavesManager from "../managers/EnemyWavesManager";
import Ui from "./Ui";
import CastleMap from "../maps/CastleMap";
import { eventKeys, sceneEvents } from "../events/EventsCenter";
import { EnemyType, TowerType } from "../interfaces/Sprite.interfaces";
import { Bandit } from "../sprites/enemies/Bandit";
import Tower from "../sprites/towers/Tower";
import Enemy from "../sprites/enemies/Enemy";
import TowerCrossbow from "../sprites/towers/TowerCrossbow";

interface TowerGroup {
    group: Phaser.GameObjects.Group;
    textureKey: string;
}

export default class Game extends Phaser.Scene {
    constructor() {
        super(sceneKeys.game);
    }

    #uiScene: Ui;
    #player: Player;
    #castleMap: CastleMap;
    #enemyWavesManager = new EnemyWavesManager();
    #enemyGroupsByType: Map<EnemyType, Phaser.Physics.Arcade.Group> = new Map();
    #towerGroupsByType: Map<TowerType, TowerGroup> = new Map();
    #previousTargetTilePosition: Phaser.Math.Vector2;

    init() {
        this.#initEventHandlers();
    }

    create() {
        this.#castleMap = new CastleMap(this);
        this.#createPlayer();
        this.#createEnemyGroups();
        this.#createTowerGroups();
        this.#createUiScene();
    }

    update(time: number, delta: number) {
        this.#player?.update(time, delta);
        this.#enemyWavesManager?.update(time, delta);
    }

    #createUiScene() {
        this.#uiScene = new Ui();
        this.game.scene.add(sceneKeys.ui, this.#uiScene, true);
        sceneEvents.emit(eventKeys.uiScene.setTargetFrame, Player);
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
        this.#towerGroupsByType.set(TowerType.Crossbow, {
            group: crossbowTowers,
            textureKey: textureKeys.towers.crossbow,
        });
    }

    #destroyGameObjects() {
        for (const [_, enemies] of this.#enemyGroupsByType.entries()) {
            enemies.destroy(true);
        }
        for (const [_, towers] of this.#towerGroupsByType.entries()) {
            towers.group.destroy(true);
        }
        this.#player.destroy();
    }

    #initEventHandlers() {
        //Input events
        this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
        // Scene events
        sceneEvents.on(eventKeys.gameScene.spawnEnemy, this.#handleSpawnEnemy, this);
        // Remove events on scene shutdown
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#destroyGameObjects();
            this.#uiScene.scene.stop();
            this.input.off(Phaser.Input.Events.POINTER_UP);
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
            sceneEvents.off(eventKeys.gameScene.createEnemies);
            sceneEvents.off(eventKeys.gameScene.spawnEnemy);
        });
    }

    #addTower(type: TowerType, tilePosition: Phaser.Math.Vector2) {
        const layerTowerBuildable = this.#castleMap.getLayer(layerKeys.tower.buildable);
        if (!layerTowerBuildable.hasTileAt(tilePosition.x, tilePosition.y)) {
            // TODO REMOVE TEST
            console.log(`addTower - Cannot build at ${JSON.stringify(tilePosition)}`);
            return;
        }

        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        if (layerTowerBuilt.hasTileAt(tilePosition.x, tilePosition.y)) {
            // TODO Change the image at cursor color to indicate an invalid placement?
            console.log(`addTower - Tower already built at ${JSON.stringify(tilePosition)}`);
            return;
        }

        const worldPosition = layerTowerBuildable.tileToWorldXY(tilePosition.x, tilePosition.y);
        const towerGroup = this.#towerGroupsByType.get(type);
        towerGroup.group.get(worldPosition.x, worldPosition.y, towerGroup.textureKey);

        const tileIndex = 17;
        layerTowerBuilt.putTileAt(tileIndex, tilePosition.x, tilePosition.y);

        sceneEvents.emit(eventKeys.gameScene.towerAdded);
    }

    #removeTower(tower: Tower) {
        const towerType = tower.getTowerType();
        this.#towerGroupsByType.get(towerType).group.remove(tower);
        tower.destroy();

        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        const towerTilePosition = layerTowerBuilt.tileToWorldXY(tower.x, tower.y);
        layerTowerBuilt.removeTileAt(towerTilePosition.x, towerTilePosition.y);
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

    #handlePointerUp(pointer: Phaser.Input.Pointer) {
        const { worldX, worldY } = pointer;
        const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
        const targetTilePosition = layerGroundPlayer.worldToTileXY(worldX, worldY);

        if (layerGroundPlayer.hasTileAtWorldXY(worldX, worldY)) {
            this.#player.findPathAndMoveTo(targetTilePosition, layerGroundPlayer, [
                this.#castleMap.getLayer(layerKeys.wall.side),
                this.#castleMap.getLayer(layerKeys.wall.top),
                this.#castleMap.getLayer(layerKeys.props),
            ]);
        }

        this.#addTower(TowerType.Crossbow, targetTilePosition);
    }

    #handlePointerMove(pointer: Phaser.Input.Pointer) {
        const { worldX, worldY } = pointer;
        const layerGroundInteractive = this.#castleMap.getLayer(layerKeys.ground.interactive);
        const targetTilePosition = layerGroundInteractive.worldToTileXY(worldX, worldY);
        const isInteractiveGroundHovered = layerGroundInteractive.hasTileAt(
            targetTilePosition.x,
            targetTilePosition.y
        );

        if (
            this.#previousTargetTilePosition ||
            (this.#previousTargetTilePosition && !isInteractiveGroundHovered)
        ) {
            this.#removePreviousTargetTile();
        }

        if (isInteractiveGroundHovered) {
            this.#addTargetTile(targetTilePosition);
        }
    }

    #handleSpawnEnemy() {
        const startingTilePosition = new Phaser.Math.Vector2(10, 0);
        const targetTilePosition = new Phaser.Math.Vector2(10, 16);
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

        enemy.findPathAndMoveTo(targetTilePosition, layerGroundEnemy, [
            this.#castleMap.getLayer(layerKeys.wall.side),
            this.#castleMap.getLayer(layerKeys.tower.built),
        ]);
    }
}

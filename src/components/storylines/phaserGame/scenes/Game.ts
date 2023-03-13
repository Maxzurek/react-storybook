import { Vector2d } from "../interfaces/Global.interfaces";
import { textureKeys, sceneKeys, layerKeys } from "../Keys";
import "../sprites/Player";
import "../sprites/enemies/Enemy";
import Player from "../sprites/Player";
import PathUtils from "../utils/Path.utils";
import EnemyWavesManager from "../managers/EnemyWavesManager";
import Ui from "./Ui";
import CastleMap from "../maps/CastleMap";
import ComponentService from "../components/ComponentService";
import { eventKeys, sceneEvents } from "../events/EventsCenter";
import { EnemyType } from "../interfaces/Sprite.interfaces";
import UiLifeBarComponent from "../components/Ui/UiLifeBarComponent";
import Sprite from "../sprites/Sprite";
import { Bandit } from "../sprites/enemies/Bandit";

export default class Game extends Phaser.Scene {
    constructor() {
        super(sceneKeys.game);
    }

    #uiScene: Ui;
    #player: Player;
    #castleMap: CastleMap;
    #components = new ComponentService();
    #enemyWavesManager = new EnemyWavesManager();
    #enemyGroupsByType: Map<EnemyType, Phaser.Physics.Arcade.Group> = new Map();
    #previousTargetTilePosition: Vector2d;

    init() {
        this.#initEventHandlers();
    }

    create() {
        this.#castleMap = new CastleMap(this);
        this.#createPlayer();
        this.#createUiScene();
    }

    update(time: number, delta: number) {
        this.#player?.update(time, delta);
        this.#enemyWavesManager?.update(time, delta);
        this.#components?.update(time, delta);

        // TODO TESTING UI HEALTH BAR UPDATE, REMOVE
        const enemy = this.#enemyGroupsByType.get(EnemyType.Bandit)?.getChildren()[0];
        if (enemy) {
            const component = this.#components.findComponent(enemy, UiLifeBarComponent);
            component?.updateFillPercentage(time / 10000);
        }
    }

    #createUiScene() {
        this.#uiScene = new Ui();
        this.game.scene.add(sceneKeys.ui, this.#uiScene, true);
        sceneEvents.emit(eventKeys.uiScene.setTargetFrame, Player);
    }

    #createPlayer() {
        const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
        const startingTile: Vector2d = { x: 10, y: 8 };
        const startingPosition = layerGroundPlayer.tileToWorldXY(startingTile.x, startingTile.y);
        startingPosition.x += layerGroundPlayer.tilemap.tileWidth / 2;
        startingPosition.y += layerGroundPlayer.tilemap.tileHeight / 2;

        this.#player = this.add.player(startingPosition.x, startingPosition.y, textureKeys.sprites);
    }

    #initEventHandlers() {
        //Input events
        this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
        // Scene events
        sceneEvents.on(eventKeys.gameScene.createEnemies, this.#handleCreateEnemies, this);
        sceneEvents.on(eventKeys.gameScene.spawnEnemy, this.#handleSpawnEnemy, this);
        // Remove events on scene shutdown
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.#components.destroy();
            this.#uiScene.scene.stop();
            this.input.off(Phaser.Input.Events.POINTER_UP);
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
            sceneEvents.off(eventKeys.gameScene.spawnEnemy);
        });
    }

    #moveSprite(config: {
        targetTile: Phaser.Math.Vector2;
        sprite: Sprite;
        walkableLayer: Phaser.Tilemaps.TilemapLayer;
        unWalkableLayers: Phaser.Tilemaps.TilemapLayer[];
    }) {
        const { targetTile, sprite, walkableLayer, unWalkableLayers } = config;
        const startTile = walkableLayer.worldToTileXY(sprite.x, sprite.y);
        const path = PathUtils.findPath(startTile, targetTile, {
            walkableLayer,
            unWalkableLayers,
        });

        sprite.moveAlong(path);
    }

    #addTargetTile(targetTilePosition: Phaser.Math.Vector2) {
        const layerGroundInteractive = this.#castleMap.getLayer(layerKeys.ground.interactive);
        layerGroundInteractive.putTileAt(586, targetTilePosition.x, targetTilePosition.y);

        this.#previousTargetTilePosition = {
            ...targetTilePosition,
        };
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
        const targetTile = layerGroundPlayer.worldToTileXY(worldX, worldY);

        if (layerGroundPlayer.hasTileAtWorldXY(worldX, worldY)) {
            this.#moveSprite({
                targetTile,
                sprite: this.#player,
                walkableLayer: layerGroundPlayer,
                unWalkableLayers: [
                    this.#castleMap.getLayer(layerKeys.wall.side),
                    this.#castleMap.getLayer(layerKeys.wall.top),
                    this.#castleMap.getLayer(layerKeys.props),
                ],
            });
        }
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

    #handleCreateEnemies(enemyType: EnemyType) {
        const groupConfig: Phaser.Types.Physics.Arcade.PhysicsGroupConfig = {
            runChildUpdate: true,
        };

        switch (enemyType) {
            case EnemyType.Bandit:
                groupConfig.classType = Bandit;
                break;
            case EnemyType.Wolf:
                groupConfig.classType = Bandit; // TODO replace with correct enemy type
                break;
            default:
                console.log(`#handleCreateEnemies - Invalid enemyType: ${enemyType}`);
                break;
        }

        const enemyGroup = this.physics.add.group(groupConfig);
        this.#enemyGroupsByType.set(enemyType, enemyGroup);
    }

    #handleSpawnEnemy() {
        const startingTile: Vector2d = { x: 10, y: 0 };
        const targetTile = new Phaser.Math.Vector2(10, 16);
        const layerGroundEnemy = this.#castleMap.getLayer(layerKeys.ground.enemy);
        const enemyStartingPosition = layerGroundEnemy.tileToWorldXY(
            startingTile.x,
            startingTile.y
        );
        enemyStartingPosition.x += layerGroundEnemy.tilemap.tileWidth / 2;
        enemyStartingPosition.y += layerGroundEnemy.tilemap.tileHeight / 2;

        const enemy = this.#enemyGroupsByType
            .get(EnemyType.Bandit) // TODO replace with currentWaveState.enemyType
            .get(enemyStartingPosition.x, enemyStartingPosition.y, textureKeys.sprites);
        this.#components.addComponent(enemy, new UiLifeBarComponent());

        this.#moveSprite({
            targetTile,
            sprite: enemy,
            walkableLayer: layerGroundEnemy,
            unWalkableLayers: [this.#castleMap.getLayer(layerKeys.wall.side)],
        });
    }
}

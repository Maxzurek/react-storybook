import { Vector2d } from "../interfaces/Global.interfaces";
import { textureKeys, sceneKeys, layerKeys } from "../Keys";
import "../sprites/Player";
import "../sprites/enemies/Enemy";
import Player from "../sprites/Player";
import PathUtils from "../utils/Path.utils";
import EnemyWavesManager from "../managers/EnemyWavesManager";
import Ui from "./Ui";
import CastleMap from "../maps/CastleMap";

export default class Game extends Phaser.Scene {
    constructor() {
        super(sceneKeys.game);
    }

    #uiScene: Ui;
    #player: Player;
    #previousHoveredTilePosition: Vector2d;
    #enemyWavesManager: EnemyWavesManager;
    #castleMap: CastleMap;

    init() {
        this.#initEvents();
    }

    create() {
        this.#castleMap = new CastleMap(this);

        this.#createPlayer();

        this.#uiScene = new Ui();
        this.game.scene.add(sceneKeys.ui, this.#uiScene, true);
        this.#uiScene.setTargetFrame(Player);

        this.#enemyWavesManager = new EnemyWavesManager(this, this.#uiScene, this.#castleMap);
    }

    update(time: number, delta: number) {
        if (this.#player) {
            this.#player.update();
        }

        if (this.#enemyWavesManager) {
            this.#enemyWavesManager.update(time, delta);
        }
    }

    #createPlayer() {
        const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
        const startingTile: Vector2d = { x: 10, y: 8 };
        const startingPosition = layerGroundPlayer.tileToWorldXY(startingTile.x, startingTile.y);
        startingPosition.x += layerGroundPlayer.tilemap.tileWidth / 2;
        startingPosition.y += layerGroundPlayer.tilemap.tileHeight / 2;

        this.#player = this.add.player(startingPosition.x, startingPosition.y, textureKeys.sprites);
    }

    #initEvents() {
        this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;
            const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
            const layerWallSide = this.#castleMap.getLayer(layerKeys.wall.side);
            const layerWallTop = this.#castleMap.getLayer(layerKeys.wall.top);
            const layerProps = this.#castleMap.getLayer(layerKeys.props);

            const startTile = layerGroundPlayer.worldToTileXY(this.#player.x, this.#player.y);
            const targetTile = layerGroundPlayer.worldToTileXY(worldX, worldY);
            const path = PathUtils.findPath(startTile, targetTile, layerGroundPlayer, {
                unWalkableLayers: [layerWallSide, layerWallTop, layerProps],
            });

            this.#player.moveAlong(path);
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;
            const layerGroundPlayer = this.#castleMap.getLayer(layerKeys.ground.player);
            const layerGroundInteractive = this.#castleMap.getLayer(layerKeys.ground.interactive);

            const targetTilePosition = layerGroundPlayer.worldToTileXY(worldX, worldY);
            const isInteractiveGroundHovered = layerGroundInteractive.hasTileAt(
                targetTilePosition.x,
                targetTilePosition.y
            );

            if (
                this.#previousHoveredTilePosition ||
                (this.#previousHoveredTilePosition && !isInteractiveGroundHovered)
            ) {
                layerGroundInteractive.putTileAt(
                    588,
                    this.#previousHoveredTilePosition.x,
                    this.#previousHoveredTilePosition.y
                );
            }

            if (isInteractiveGroundHovered) {
                layerGroundInteractive.putTileAt(586, targetTilePosition.x, targetTilePosition.y);
                this.#previousHoveredTilePosition = {
                    ...targetTilePosition,
                };
            }
        });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off(Phaser.Input.Events.POINTER_UP);
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
        });
    }
}

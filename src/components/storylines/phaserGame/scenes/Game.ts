import { Vector2d } from "../interfaces/Global.interfaces";
import { assetKeys, sceneKeys } from "../Keys";
import { tiledMapConfig } from "../configs/TiledConfig";
import "../sprites/Player";
import "../sprites/enemies/Enemy";
import Player from "../sprites/Player";
import PathUtils from "../utils/Path.utils";
import EnemyWavesManager from "../managers/EnemyWavesManager";

export default class Game extends Phaser.Scene {
    constructor() {
        super(sceneKeys.game);
    }

    #tileMapCastle: Phaser.Tilemaps.Tilemap;
    #layerGroundPlayer: Phaser.Tilemaps.TilemapLayer;
    #layerGroundEnemy: Phaser.Tilemaps.TilemapLayer;
    #layerGroundInteractive: Phaser.Tilemaps.TilemapLayer;
    #layerWallTop: Phaser.Tilemaps.TilemapLayer;
    #layerWallSide: Phaser.Tilemaps.TilemapLayer;
    #layerProps: Phaser.Tilemaps.TilemapLayer;
    #player: Player;
    #previousHoveredTilePosition: Vector2d;
    #enemyWavesManager: EnemyWavesManager;

    create() {
        this.#createMap();
        // this.#createMapDebugGraphics();
        this.#createPlayer();
        this.#initEvents();
        this.#enemyWavesManager = new EnemyWavesManager(
            this,
            this.#layerGroundEnemy,
            this.#layerWallSide
        );
    }

    update(time: number, delta: number) {
        if (this.#player) {
            this.#player.update();
        }

        if (this.#enemyWavesManager) {
            this.#enemyWavesManager.update(time, delta);
        }
    }

    #createMap() {
        this.#tileMapCastle = this.make.tilemap({
            key: assetKeys.map.castle,
            tileWidth: tiledMapConfig.castle.tiles.width,
            tileHeight: tiledMapConfig.castle.tiles.height,
        });
        const tileSetUi = this.#tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.ui,
            assetKeys.tileSet.ui
        );
        const tileSetWall = this.#tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.wall,
            assetKeys.tileSet.wall
        );
        const tileSetGrass = this.#tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.grass,
            assetKeys.tileSet.grass
        );
        const tileSetProps = this.#tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.props,
            assetKeys.tileSet.props
        );

        this.#layerGroundPlayer = this.#tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.groundPlayer,
            tileSetGrass,
            0,
            0
        );
        this.#layerGroundEnemy = this.#tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.groundEnemy,
            tileSetGrass,
            0,
            0
        );
        this.#layerGroundInteractive = this.#tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.groundInteractive,
            tileSetUi,
            0,
            0
        );
        this.#layerWallTop = this.#tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.wallTop,
            tileSetGrass,
            0,
            0
        );
        this.#layerWallSide = this.#tileMapCastle
            .createLayer(tiledMapConfig.castle.layerId.wallSide, tileSetWall, 0, 0)
            .setDepth(1)
            .setCollisionByProperty({ collides: true });
        this.#layerProps = this.#tileMapCastle
            .createLayer(tiledMapConfig.castle.layerId.props, tileSetProps, 0, 0)
            .setDepth(1)
            .setCollisionByProperty({ collides: true });
    }

    #createMapDebugGraphics() {
        const styleConfig: Phaser.Types.Tilemaps.StyleConfig = {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        };
        const debugGraphics = this.add.graphics().setAlpha(0.7);
        this.#layerWallSide.renderDebug(debugGraphics, styleConfig);
        this.#layerProps.renderDebug(debugGraphics, styleConfig);
    }

    #createPlayer() {
        const startingTile: Vector2d = { x: 10, y: 8 };
        const startingPosition = this.#layerGroundPlayer.tileToWorldXY(
            startingTile.x,
            startingTile.y
        );
        startingPosition.x += this.#layerGroundPlayer.tilemap.tileWidth / 2;
        startingPosition.y += this.#layerGroundPlayer.tilemap.tileHeight / 2;

        this.#player = this.add.player(startingPosition.x, startingPosition.y, assetKeys.sprites);
    }

    #initEvents() {
        this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;

            const startTile = this.#layerGroundPlayer.worldToTileXY(this.#player.x, this.#player.y);
            const targetTile = this.#layerGroundPlayer.worldToTileXY(worldX, worldY);
            const path = PathUtils.findPath(startTile, targetTile, this.#layerGroundPlayer, {
                unWalkableLayers: [this.#layerWallSide, this.#layerWallTop, this.#layerProps],
            });

            this.#player.moveAlong(path);
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;

            const targetTilePosition = this.#layerGroundPlayer.worldToTileXY(worldX, worldY);
            const isInteractiveGroundHovered = this.#layerGroundInteractive.hasTileAt(
                targetTilePosition.x,
                targetTilePosition.y
            );

            if (
                this.#previousHoveredTilePosition ||
                (this.#previousHoveredTilePosition && !isInteractiveGroundHovered)
            ) {
                this.#layerGroundInteractive.putTileAt(
                    588,
                    this.#previousHoveredTilePosition.x,
                    this.#previousHoveredTilePosition.y
                );
            }

            if (isInteractiveGroundHovered) {
                this.#layerGroundInteractive.putTileAt(
                    586,
                    targetTilePosition.x,
                    targetTilePosition.y
                );
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

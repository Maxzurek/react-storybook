import { Vector2d } from "../interfaces/Global.interfaces";
import { assetKeys, sceneKeys } from "../Keys";
import { tiledMapConfig } from "../configs/TiledConfig";
import "../sprites/Player";
import Player from "../sprites/Player";
import findPath from "../utils/FindPath";

export default class Game extends Phaser.Scene {
    constructor() {
        super(sceneKeys.game);
    }

    // Layers
    #tileMapCastle: Phaser.Tilemaps.Tilemap;
    #layerGround: Phaser.Tilemaps.TilemapLayer;
    #layerGroundInteractive: Phaser.Tilemaps.TilemapLayer;
    #layerWallTwo: Phaser.Tilemaps.TilemapLayer;
    #layerWallOne: Phaser.Tilemaps.TilemapLayer;
    #layerProps: Phaser.Tilemaps.TilemapLayer;

    #player: Player = null;
    #previousHoveredTilePosition: Vector2d = null;

    create() {
        this.#createMap();
        // this.#createMapDebugGraphics();
        this.#createPlayer();
        this.#initEvents();
    }

    update() {
        if (this.#player) {
            this.#player.update();
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

        this.#layerGround = this.#tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.ground,
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
        this.#layerWallTwo = this.#tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.wallTwo,
            tileSetGrass,
            0,
            0
        );
        this.#layerWallOne = this.#tileMapCastle
            .createLayer(tiledMapConfig.castle.layerId.wallOne, tileSetWall, 0, 0)
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
        this.#layerWallOne.renderDebug(debugGraphics, styleConfig);
        this.#layerProps.renderDebug(debugGraphics, styleConfig);
    }

    #createPlayer() {
        const startingPosition = this.#layerGround.tileToWorldXY(10, 8);
        startingPosition.x += this.#layerGround.tilemap.tileWidth / 2;
        startingPosition.y += this.#layerGround.tilemap.tileHeight / 2;
        this.#player = this.add.player(
            startingPosition.x,
            startingPosition.y,
            assetKeys.sprite.characters
        );
    }

    #initEvents() {
        this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;

            const startTile = this.#worldPositionToTileXY(
                this.#player.x,
                this.#player.y,
                this.#layerGround
            );
            const targetTile = this.#worldPositionToTileXY(worldX, worldY, this.#layerGround);
            const path = findPath(
                startTile,
                targetTile,
                this.#layerGround,
                this.#layerWallOne,
                this.#layerProps
            );

            this.#player.moveAlong(path);
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;

            const targetTile = this.#worldPositionToTileXY(
                worldX,
                worldY,
                this.#layerGroundInteractive
            );
            const isInteractiveGroundHovered = this.#layerGroundInteractive.hasTileAt(
                targetTile.x,
                targetTile.y
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
                this.#layerGroundInteractive.putTileAt(586, targetTile.x, targetTile.y);
                this.#previousHoveredTilePosition = { x: targetTile.x, y: targetTile.y };
            }
        });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off(Phaser.Input.Events.POINTER_UP);
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
        });
    }

    #worldPositionToTileXY(x: number, y: number, layer: Phaser.Tilemaps.TilemapLayer) {
        const yOffset = -12.125;
        return layer.worldToTileXY(x, y + yOffset);
    }
}

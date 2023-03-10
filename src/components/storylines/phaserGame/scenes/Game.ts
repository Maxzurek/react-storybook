import { mapSize } from "../configs/GameConfig";
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
        this.#createMapDebugGraphics();
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
        const playerStartPosition: Vector2d = {
            x: mapSize.width / 2,
            y: mapSize.height / 2,
        };
        this.#player = this.add.player(
            playerStartPosition.x,
            playerStartPosition.y,
            assetKeys.sprite.characters,
            124 // TODO replace keyframe number with var
        );
    }

    #initEvents() {
        this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;
            console.log(worldX, worldY);

            const startVec = this.#layerGround.worldToTileXY(this.#player.x, this.#player.y);
            const targetVec = this.#layerGround.worldToTileXY(worldX, worldY);

            const path = findPath(
                startVec,
                targetVec,
                this.#layerGround,
                this.#layerWallOne,
                this.#layerProps
            );
            this.#player.moveAlong(path);
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
            const { worldX, worldY } = pointer;
            const offSetY = 10;
            const targetVec = this.#layerGroundInteractive.worldToTileXY(worldX, worldY - offSetY);

            const isInteractiveGroundHovered = this.#layerGroundInteractive.hasTileAt(
                targetVec.x,
                targetVec.y
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
                this.#layerGroundInteractive.putTileAt(586, targetVec.x, targetVec.y);
                this.#previousHoveredTilePosition = { x: targetVec.x, y: targetVec.y };
            }
        });

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off(Phaser.Input.Events.POINTER_UP);
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
        });
    }
}

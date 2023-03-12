import { tiledMapConfig } from "../configs/TiledConfig";
import { assetKeys } from "../Keys";

type MapKey = string;

export default class MapManager {
    #scene: Phaser.Scene;
    tileMapCastle: Phaser.Tilemaps.Tilemap;
    layerGroundPlayer: Phaser.Tilemaps.TilemapLayer;
    layerGroundEnemy: Phaser.Tilemaps.TilemapLayer;
    layerGroundInteractive: Phaser.Tilemaps.TilemapLayer;
    layerWallTop: Phaser.Tilemaps.TilemapLayer;
    layerWallSide: Phaser.Tilemaps.TilemapLayer;
    layerProps: Phaser.Tilemaps.TilemapLayer;
    layerUi: Phaser.Tilemaps.TilemapLayer;

    /**
     * A map of key/value. Use the assetKeys.map key to access the map
     */
    #maps: Map<MapKey, Phaser.Tilemaps.Tilemap> = new Map();
    #layers: Map<MapKey, Phaser.Tilemaps.TilemapLayer> = new Map();

    constructor(scene: Phaser.Scene) {
        this.#scene = scene;
        this.#createCastleMap();
    }

    #createCastleMap() {
        const castleMap = this.#scene.make.tilemap({
            key: assetKeys.map.castle,
            tileWidth: tiledMapConfig.castle.tiles.width,
            tileHeight: tiledMapConfig.castle.tiles.height,
        });
        this.#maps.set(assetKeys.map.castle, castleMap);
        const tileSetUi = this.tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.ui,
            assetKeys.tileSet.ui
        );
        const tileSetWall = this.tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.wall,
            assetKeys.tileSet.wall
        );
        const tileSetGrass = this.tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.grass,
            assetKeys.tileSet.grass
        );
        const tileSetProps = this.tileMapCastle.addTilesetImage(
            tiledMapConfig.castle.tileSetName.props,
            assetKeys.tileSet.props
        );

        this.layerGroundPlayer = this.tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.groundPlayer,
            tileSetGrass,
            0,
            0
        );
        this.layerGroundEnemy = this.tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.groundEnemy,
            tileSetGrass,
            0,
            0
        );
        this.layerGroundInteractive = this.tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.groundInteractive,
            tileSetUi,
            0,
            0
        );
        this.layerWallTop = this.tileMapCastle.createLayer(
            tiledMapConfig.castle.layerId.wallTop,
            tileSetGrass,
            0,
            0
        );
        this.layerWallSide = this.tileMapCastle
            .createLayer(tiledMapConfig.castle.layerId.wallSide, tileSetWall, 0, 0)
            .setDepth(1)
            .setCollisionByProperty({ collides: true });
        this.layerProps = this.tileMapCastle
            .createLayer(tiledMapConfig.castle.layerId.props, tileSetProps, 0, 0)
            .setDepth(1)
            .setCollisionByProperty({ collides: true });
        this.layerUi = this.tileMapCastle
            .createLayer(tiledMapConfig.castle.layerId.ui, tileSetWall, 0, 0)
            .setDepth(1);
    }
}

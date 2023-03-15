import { tiledMapConfig } from "../configs/TiledConfig";
import { layerKeys, textureKeys } from "../Keys";
import depthLevels from "../scenes/DepthLevels";

export default class CastleMap {
    #scene: Phaser.Scene;
    #map: Phaser.Tilemaps.Tilemap;
    #layers: Map<string, Phaser.Tilemaps.TilemapLayer> = new Map();

    constructor(scene: Phaser.Scene) {
        this.#scene = scene;

        this.#createMap();
        // this.#createMapDebugGraphics();
    }

    getLayer(key: string) {
        const layer = this.#layers.get(key);

        if (!layer) {
            console.log(`CastleMap - getLayer: Invalid layer key ${key}`);
        }

        return layer;
    }

    #createMap() {
        this.#map = this.#scene.make.tilemap({
            key: textureKeys.map.castle,
            tileWidth: tiledMapConfig.castle.tiles.width,
            tileHeight: tiledMapConfig.castle.tiles.height,
        });
        const tileSetUi = this.#map.addTilesetImage(
            tiledMapConfig.castle.tileSetName.ui,
            textureKeys.tileSet.ui
        );
        const tileSetWall = this.#map.addTilesetImage(
            tiledMapConfig.castle.tileSetName.wall,
            textureKeys.tileSet.wall
        );
        const tileSetGrass = this.#map.addTilesetImage(
            tiledMapConfig.castle.tileSetName.grass,
            textureKeys.tileSet.grass
        );
        const tileSetProps = this.#map.addTilesetImage(
            tiledMapConfig.castle.tileSetName.props,
            textureKeys.tileSet.props
        );

        const layerTowerBuilt = this.#map.createLayer(
            tiledMapConfig.castle.layerName.towerBuilt,
            tileSetProps,
            0,
            0
        );
        layerTowerBuilt.setVisible(false);
        this.#layers.set(layerKeys.tower.built, layerTowerBuilt);

        const layerTowerBuildable = this.#map.createLayer(
            tiledMapConfig.castle.layerName.towerBuildable,
            tileSetProps,
            0,
            0
        );
        layerTowerBuildable.setVisible(false);
        this.#layers.set(layerKeys.tower.buildable, layerTowerBuildable);

        const layerGroundEnemy = this.#map.createLayer(
            tiledMapConfig.castle.layerName.groundEnemy,
            tileSetProps,
            0,
            0
        );
        layerGroundEnemy.setVisible(false);
        this.#layers.set(layerKeys.ground.enemy, layerGroundEnemy);

        const layerGroundPlayer = this.#map.createLayer(
            tiledMapConfig.castle.layerName.groundPlayer,
            tileSetProps,
            0,
            0
        );
        layerGroundPlayer.setVisible(false);
        this.#layers.set(layerKeys.ground.player, layerGroundPlayer);

        const layerGroundBase = this.#map.createLayer(
            tiledMapConfig.castle.layerName.groundBase,
            tileSetGrass,
            0,
            0
        );
        this.#layers.set(layerKeys.ground.base, layerGroundBase);

        const layerGroundInteractive = this.#map
            .createLayer(tiledMapConfig.castle.layerName.groundInteractive, tileSetUi, 0, 0)
            .setDepth(depthLevels.high);
        this.#layers.set(layerKeys.ground.interactive, layerGroundInteractive);

        const layerWallTop = this.#map.createLayer(
            tiledMapConfig.castle.layerName.wallTop,
            tileSetGrass,
            0,
            0
        );
        this.#layers.set(layerKeys.wall.top, layerWallTop);

        const layerWallSide = this.#map
            .createLayer(tiledMapConfig.castle.layerName.wallSide, tileSetWall, 0, 0)
            .setCollisionByProperty({ collides: true });
        this.#layers.set(layerKeys.wall.side, layerWallSide);

        const layerProps = this.#map
            .createLayer(tiledMapConfig.castle.layerName.props, tileSetProps, 0, 0)
            .setDepth(depthLevels.high)
            .setCollisionByProperty({ collides: true });
        this.#layers.set(layerKeys.props, layerProps);
    }

    #createMapDebugGraphics() {
        const styleConfig: Phaser.Types.Tilemaps.StyleConfig = {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        };
        const debugGraphics = this.#scene.add.graphics().setAlpha(0.7);
        this.getLayer(layerKeys.wall.side).renderDebug(debugGraphics, styleConfig);
        this.getLayer(layerKeys.props).renderDebug(debugGraphics, styleConfig);
    }
}

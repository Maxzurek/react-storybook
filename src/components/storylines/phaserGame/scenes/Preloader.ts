import { assetKeys, sceneKeys } from "../Keys";
import castleMap from "../maps/castleMap.json";

export default class Preloader extends Phaser.Scene {
    constructor() {
        super(sceneKeys.preload);
    }

    preload() {
        this.load.image({
            key: assetKeys.tileSet.grass,
            url: "/phaser/assets/textures/tx-tileset-grass.png",
        });
        this.load.image({
            key: assetKeys.tileSet.wall,
            url: "/phaser/assets/textures/tx-tileset-wall.png",
        });
        this.load.image({
            key: assetKeys.tileSet.props,
            url: "/phaser/assets/textures/tx-props.png",
        });
        this.load.image({
            key: assetKeys.tileSet.ui,
            url: "/phaser/assets/textures/tx-ui.png",
        });
        this.load.tilemapTiledJSON({ key: assetKeys.map.castle, url: castleMap });
        this.load.spritesheet({
            key: assetKeys.sprites,
            url: "/phaser/assets/sprites/sprites.png",
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                startFrame: 0,
                endFrame: 184,
            },
        });
    }

    create() {
        this.scene.start(sceneKeys.game);
    }
}

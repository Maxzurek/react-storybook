import { textureKeys, sceneKeys } from "../Keys";
import castleMap from "../tiled//castleMap.json";
import uiMap from "../tiled/uiMap.json";

export default class Preloader extends Phaser.Scene {
    constructor() {
        super(sceneKeys.preload);
    }

    preload() {
        this.#loadTileSets();
        this.#loadTowerSprites();
        this.#loadSprites();
        this.#loadMaps();
    }

    #loadTileSets() {
        this.load.image({
            key: textureKeys.tileSet.stoneGround,
            url: "/phaser/assets/textures/tx-tileset-stone-ground.png",
        });
        this.load.image({
            key: textureKeys.tileSet.grass,
            url: "/phaser/assets/textures/tx-tileset-grass.png",
        });
        this.load.image({
            key: textureKeys.tileSet.wall,
            url: "/phaser/assets/textures/tx-tileset-wall.png",
        });
        this.load.image({
            key: textureKeys.tileSet.props,
            url: "/phaser/assets/textures/tx-props.png",
        });
        this.load.image({
            key: textureKeys.tileSet.ui,
            url: "/phaser/assets/textures/tx-ui.png",
        });
    }

    #loadTowerSprites() {
        this.load.spritesheet({
            key: textureKeys.towers.crossbow,
            url: "/phaser/assets/towers/tower-crossbow.png",
            frameConfig: {
                frameWidth: 64,
                frameHeight: 128,
                startFrame: 0,
                endFrame: 2,
            },
        });
        this.load.spritesheet({
            key: textureKeys.weapons.crossbow,
            url: "/phaser/assets/weapons/weapon-tower-crossbow.png",
            frameConfig: {
                frameWidth: 96,
                frameHeight: 96,
                startFrame: 0,
                endFrame: 5,
            },
        });
        this.load.spritesheet({
            key: textureKeys.projectiles.crossbow,
            url: "/phaser/assets/projectiles/projectile-tower-crossbow.png",
            frameConfig: {
                frameWidth: 8,
                frameHeight: 40,
                startFrame: 0,
                endFrame: 2,
            },
        });
    }

    #loadSprites() {
        this.load.spritesheet({
            key: textureKeys.sprites,
            url: "/phaser/assets/sprites/sprites.png",
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                startFrame: 0,
                endFrame: 184,
            },
        });
    }

    #loadMaps() {
        this.load.tilemapTiledJSON({ key: textureKeys.map.castle, url: castleMap });
        this.load.tilemapTiledJSON({ key: textureKeys.map.ui, url: uiMap });
    }

    create() {
        this.scene.start(sceneKeys.game);
    }
}

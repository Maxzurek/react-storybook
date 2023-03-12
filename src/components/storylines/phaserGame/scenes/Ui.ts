import { tiledMapConfig } from "../configs/TiledConfig";
import { Vector2d } from "../interfaces/Global.interfaces";
import { assetKeys, sceneKeys } from "../Keys";
import Player from "../sprites/Player";

export default class Ui extends Phaser.Scene {
    #tileMapUi: Phaser.Tilemaps.Tilemap;
    #layerUi: Phaser.Tilemaps.TilemapLayer;
    #targetFrame: Phaser.GameObjects.GameObject;
    #layerUiBackground: Phaser.Tilemaps.TilemapLayer;
    #uiTargetFrameTopLeftTile: Vector2d = { x: 0, y: 18 };
    #textFieldsFrameTopLeftTile: Vector2d = { x: 4, y: 18 };
    #textFieldsTopLeftTiles: Vector2d[] = [
        { x: this.#textFieldsFrameTopLeftTile.x, y: this.#textFieldsFrameTopLeftTile.y },
        { x: this.#textFieldsFrameTopLeftTile.x + 7, y: this.#textFieldsFrameTopLeftTile.y },
        { x: this.#textFieldsFrameTopLeftTile.x, y: this.#textFieldsFrameTopLeftTile.y + 1 },
        { x: this.#textFieldsFrameTopLeftTile.x + 7, y: this.#textFieldsFrameTopLeftTile.y + 1 },
        { x: this.#textFieldsFrameTopLeftTile.x, y: this.#textFieldsFrameTopLeftTile.y + 2 },
        { x: this.#textFieldsFrameTopLeftTile.x + 7, y: this.#textFieldsFrameTopLeftTile.y + 2 },
        { x: this.#textFieldsFrameTopLeftTile.x, y: this.#textFieldsFrameTopLeftTile.y + 3 },
        { x: this.#textFieldsFrameTopLeftTile.x + 7, y: this.#textFieldsFrameTopLeftTile.y + 3 },
    ];
    #textFields: Map<number, Phaser.GameObjects.Text> = new Map();

    constructor() {
        super(sceneKeys.ui);
    }

    create() {
        this.#createMap();
        this.#initUi();
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    setTargetFrame(classType: Function) {
        if (this.#targetFrame) {
            this.#targetFrame.destroy();
        }

        const targetFramePos = this.#layerUi.tileToWorldXY(
            this.#uiTargetFrameTopLeftTile.x,
            this.#uiTargetFrameTopLeftTile.y
        );
        const group = this.add.group({ classType });
        this.#targetFrame = group
            .get(targetFramePos.x, targetFramePos.y)
            .setPosition(targetFramePos.x, targetFramePos.y)
            .setOrigin(0, 0)
            .setScale(4, 4);
    }

    setTextField(fieldNumber: number, text: string) {
        const existingTextField = this.#textFields.get(fieldNumber);
        if (existingTextField) {
            this.#textFields.get(fieldNumber).destroy();
        }

        const textInfoPos = this.#layerUi.tileToWorldXY(
            this.#textFieldsTopLeftTiles[fieldNumber].x,
            this.#textFieldsTopLeftTiles[fieldNumber].y
        );
        textInfoPos.x += this.#tileMapUi.tileWidth / 2;
        textInfoPos.y += this.#tileMapUi.tileHeight / 2;
        const textField = this.add.text(textInfoPos.x, textInfoPos.y, text);
        this.#textFields.set(fieldNumber, textField);
    }

    #createMap() {
        this.#tileMapUi = this.make.tilemap({
            key: assetKeys.map.ui,
            tileWidth: tiledMapConfig.castle.tiles.width,
            tileHeight: tiledMapConfig.castle.tiles.height,
        });

        const tileSetWall = this.#tileMapUi.addTilesetImage(
            tiledMapConfig.castle.tileSetName.wall,
            assetKeys.tileSet.wall
        );
        const tileSetStoneWall = this.#tileMapUi.addTilesetImage(
            tiledMapConfig.castle.tileSetName.stoneGround,
            assetKeys.tileSet.stoneGround
        );

        this.#layerUiBackground = this.#tileMapUi.createLayer(
            tiledMapConfig.castle.layerId.uiBackground,
            tileSetStoneWall,
            0,
            0
        );
        this.#layerUi = this.#tileMapUi.createLayer(
            tiledMapConfig.castle.layerId.ui,
            tileSetWall,
            0,
            0
        );
    }

    #initUi() {
        this.setTargetFrame(Player);
    }
}

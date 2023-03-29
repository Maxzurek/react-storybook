import { debugColors } from "../Colors";
import { tiledMapConfig } from "../configs/TiledConfig";
import { eventKeys, gameEvents } from "../events/EventsCenter";
import { TowerType } from "../interfaces/Sprite.interfaces";
import { textureKeys, sceneKeys } from "../Keys";
import ResourceManager from "../managers/ResourceManager";
import castleMap from "../tiled/castleMap.json";

export interface TextFieldUpdate {
    key: number;
    text: string;
}
export type UiKey = number;
interface UiItem {
    /**
     * This represents the index of the item.
     * The key is unique.
     * It is used by the parent container to retrieve the item, as well as for debugging.
     */
    key: number;
    position: Phaser.Math.Vector2;
    gameObjects: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group;
}
interface UiContainer {
    /**
     * The name of the container should be unique
     */
    name: string;
    position: Phaser.Math.Vector2;
    group: Phaser.GameObjects.Group;
    childrenByKey: Map<UiKey, UiItem>;
    config: ContainerConfig;
}
interface Grid {
    row: {
        count: number;
        height: number;
        gap?: number;
    };
    column: {
        count: number;
        width: number;
        gap?: number;
    };
    itemsConfig?: {
        fontSize?: string;
        scale?: number;
        paddingLeft?: number;
    };
}
interface ContainerConfig {
    /**
     * The name of the container should be unique
     */
    name: string;
    width: number;
    height: number;
    grid: Grid;
    topLeftTile: Phaser.Math.Vector2;
}

const containerKeys = {
    targetFrame: "target-frame",
    panelWaveInfo: "wave-info",
    buttons: "buttons",
    alerts: "alerts",
    gold: "gold",
    lives: "lives",
};

const uiConfig = {
    width: 21,
    height: 4,
};
const containerConfigs: ContainerConfig[] = [
    {
        name: containerKeys.targetFrame,
        width: 4,
        height: uiConfig.height,
        grid: {
            row: {
                count: 1,
                height: 1,
            },
            column: {
                count: 1,
                width: 1,
            },
            itemsConfig: {
                scale: 4,
            },
        },
        topLeftTile: new Phaser.Math.Vector2(
            0,
            tiledMapConfig.castle.size.height - uiConfig.height
        ),
    },
    {
        name: containerKeys.panelWaveInfo,
        width: 13,
        height: uiConfig.height,
        topLeftTile: new Phaser.Math.Vector2(
            4,
            tiledMapConfig.castle.size.height - uiConfig.height
        ),
        grid: {
            row: {
                count: 4,
                height: 1,
            },
            column: {
                count: 2,
                width: 6,
                gap: 1,
            },
            itemsConfig: {
                fontSize: "14px",
            },
        },
    },
    {
        name: containerKeys.buttons,
        width: 4,
        height: uiConfig.height,
        topLeftTile: new Phaser.Math.Vector2(
            17,
            tiledMapConfig.castle.size.height - uiConfig.height
        ),
        grid: {
            row: {
                count: 4,
                height: 1,
            },
            column: {
                count: 4,
                width: 1,
            },
        },
    },
    {
        name: containerKeys.alerts,
        width: 13,
        height: 1,
        topLeftTile: new Phaser.Math.Vector2(4, 1),
        grid: {
            row: {
                count: 1,
                height: 1,
            },
            column: {
                count: 1,
                width: 13,
            },
        },
    },
    {
        name: containerKeys.lives,
        width: 3,
        height: 1,
        topLeftTile: new Phaser.Math.Vector2(0, 0),
        grid: {
            row: {
                count: 1,
                height: 1,
            },
            column: {
                count: 1,
                width: 3,
            },
        },
    },
    {
        name: containerKeys.gold,
        width: 3,
        height: 1,
        topLeftTile: new Phaser.Math.Vector2(18, 0),
        grid: {
            row: {
                count: 1,
                height: 1,
            },
            column: {
                count: 1,
                width: 3,
            },
            itemsConfig: {
                paddingLeft: 10,
            },
        },
    },
];

export default class Ui extends Phaser.Scene {
    #tileMapUi: Phaser.Tilemaps.Tilemap;
    #layerUi: Phaser.Tilemaps.TilemapLayer;
    #layerUiBackground: Phaser.Tilemaps.TilemapLayer;
    #uiContainersByName: Map<string, UiContainer> = new Map();
    #alertDuration: number;
    #alertTimer: number;
    #resourceManager: ResourceManager;

    constructor(resourceManager: ResourceManager) {
        super(sceneKeys.ui);

        this.#resourceManager = resourceManager;
    }

    init() {
        this.#initEventHandlers();
    }

    create() {
        this.#createMap();
        this.#initUiContainers();
        this.#createBuildTowerButtons();
        this.#createGoldIndicator();
        this.#createLivesIndicator();
        this.#createDebugGraphics();

        this.#handleShowAlert("Work in progress", -1); // TODO Remove, using for debug
    }

    update(time: number, delta: number) {
        if (this.#alertDuration >= 0) {
            this.#alertTimer += delta;

            if (this.#alertTimer >= this.#alertDuration) {
                this.#hideAlert();
            }
        }
    }

    destroy() {
        for (const [_, container] of this.#uiContainersByName.entries()) {
            for (const [_, child] of container.childrenByKey.entries()) {
                child.gameObjects.destroy();
            }

            container.group.destroy();
        }
        this.#tileMapUi.destroy();
        this.#layerUi.destroy();
        this.#layerUiBackground.destroy();
    }

    #createMap() {
        this.#tileMapUi = this.make.tilemap({
            key: textureKeys.map.ui,
            tileWidth: tiledMapConfig.castle.tiles.width,
            tileHeight: tiledMapConfig.castle.tiles.height,
        });

        const tileSetWall = this.#tileMapUi.addTilesetImage(
            tiledMapConfig.castle.tileSetName.wall,
            textureKeys.tileSet.wall
        );
        const tileSetStoneWall = this.#tileMapUi.addTilesetImage(
            tiledMapConfig.castle.tileSetName.stoneGround,
            textureKeys.tileSet.stoneGround
        );

        this.#layerUiBackground = this.#tileMapUi.createLayer(
            tiledMapConfig.castle.layerName.uiBackground,
            tileSetStoneWall,
            0,
            0
        );
        this.#layerUi = this.#tileMapUi.createLayer(
            tiledMapConfig.castle.layerName.ui,
            tileSetWall,
            0,
            0
        );
    }

    #getUiContainerChildrenByKey(containerConfig: ContainerConfig) {
        const { grid, topLeftTile } = containerConfig;

        const children: UiItem[] = [];
        const childrenByKey: Map<UiKey, UiItem> = new Map();
        let indexNumber = 0;

        for (
            let y = topLeftTile.y;
            y < topLeftTile.y + grid.row.count * (grid.row.height + (grid.row.gap ?? 0));
            y += grid.row.height + (grid.row.gap ?? 0)
        ) {
            for (
                let x = topLeftTile.x;
                x <
                topLeftTile.x + grid.column.count * (grid.column.width + (grid.column.gap ?? 0));
                x += grid.column.width + (grid.column.gap ?? 0)
            ) {
                const offsetX = grid.itemsConfig?.paddingLeft ?? 0;
                const position = this.#layerUi.tileToWorldXY(x, y);
                position.x += offsetX;

                const item: UiItem = {
                    key: indexNumber,
                    gameObjects: null,
                    position,
                };

                children.push(item);
                childrenByKey.set(item.key, item);
                indexNumber++;
            }
        }

        return childrenByKey;
    }

    #initUiContainers() {
        for (const containerConfig of containerConfigs) {
            const { name, topLeftTile } = containerConfig;
            const position = this.#layerUi.tileToWorldXY(topLeftTile.x, topLeftTile.y);
            const childrenByKey = this.#getUiContainerChildrenByKey(containerConfig);
            const container: UiContainer = {
                name,
                position,
                group: this.add.group(),
                childrenByKey: childrenByKey,
                config: containerConfig,
            };

            this.#uiContainersByName.set(container.name, container);
        }
    }

    #createBuildTowerButtons() {
        const container = this.#uiContainersByName.get(containerKeys.buttons);

        const button0 = container.childrenByKey.get(0);
        this.#addTowerImages(container, button0, {
            towerType: TowerType.Crossbow,
            towerTextureKey: textureKeys.towers.crossbow,
            weaponTextureKey: textureKeys.weapons.crossbow,
        });
    }

    #createLivesIndicator() {
        const container = this.#uiContainersByName.get(containerKeys.lives);
        const item = container.childrenByKey.get(0);
        const lives = this.#resourceManager.getRemainingLives();
        const text = `Lives: ${lives.toString()}`;

        item.gameObjects = this.add.text(
            item.position.x,
            item.position.y + tiledMapConfig.castle.tiles.height / 2,
            text,
            { fontSize: "14px" }
        );
    }

    #createGoldIndicator() {
        const container = this.#uiContainersByName.get(containerKeys.gold);
        const item = container.childrenByKey.get(0);
        const availableGold = this.#resourceManager.getAvailableGold();
        const text = `Gold: ${availableGold.toString()}`;

        item.gameObjects = this.add.text(
            item.position.x,
            item.position.y + tiledMapConfig.castle.tiles.height / 2,
            text,
            { fontSize: "12px" }
        );
    }

    #addTowerImages(
        container: UiContainer,
        item: UiItem,
        config: {
            towerType: TowerType;
            towerTextureKey: string;
            weaponTextureKey: string;
        }
    ) {
        const { group: containerGroup } = container;
        const { towerType, towerTextureKey, weaponTextureKey } = config;
        const buttonGroup = this.add.group();
        const scaleImageTower = 0.25;
        const scaleImageWeapon = scaleImageTower + scaleImageTower / 2;
        const offsetXImageTower = castleMap.tilewidth * (scaleImageTower + scaleImageTower / 2);
        const offsetYImageWeapon = 2;

        const imageInteractive = this.add
            .image(item.position.x, item.position.y, textureKeys.images.blank)
            .setOrigin(0, 0)
            .setInteractive()
            .on(Phaser.Input.Events.POINTER_UP, () => this.#handleCLickBuildTowerButton(towerType));
        buttonGroup.add(imageInteractive);
        containerGroup.add(imageInteractive);

        const imageTower = this.add
            .image(item.position.x + offsetXImageTower, item.position.y, towerTextureKey)
            .setScale(scaleImageTower, scaleImageTower)
            .setOrigin(0, 0);
        buttonGroup.add(imageTower);
        containerGroup.add(imageTower);

        const imageWeapon = this.add
            .image(item.position.x + offsetYImageWeapon, item.position.y, weaponTextureKey)
            .setScale(scaleImageWeapon, scaleImageWeapon)
            .setOrigin(0, 0);
        buttonGroup.add(imageTower);
        containerGroup.add(imageWeapon);

        const textShortcut = this.add.text(
            item.position.x,
            item.position.y,
            (item.key + 1).toString()
        );
        buttonGroup.add(textShortcut);
        containerGroup.add(textShortcut);

        item.gameObjects = buttonGroup;
    }

    #createDebugGraphics() {
        for (const [_, container] of this.#uiContainersByName.entries()) {
            const { position, name, childrenByKey } = container;
            const width = container.config.width * this.#tileMapUi.tileWidth;
            const height = container.config.height * this.#tileMapUi.tileHeight;

            this.#addDebugRectangle("container", position, width, height);
            this.#addDebugText("container", name, position);

            for (const [_, child] of childrenByKey.entries()) {
                const { key, position } = child;
                const { grid } = container.config;
                const width =
                    grid.column.width * this.#tileMapUi.tileWidth * (grid.itemsConfig?.scale ?? 1);
                const height =
                    grid.row.height * this.#tileMapUi.tileHeight * (grid.itemsConfig?.scale ?? 1);

                this.#addDebugRectangle("item", position, width, height);
                this.#addDebugText("item", key.toString(), position);
            }
        }
    }

    #addDebugRectangle(
        type: "container" | "item",
        position: Phaser.Math.Vector2,
        width: number,
        height: number
    ) {
        const lineWidth = 2;
        const opacity = type === "container" ? 1 : 0.5;
        const color = type === "container" ? debugColors.green : debugColors.yellow;
        const adjustedPosition = { ...position };
        let adjustedWidth = width;
        let adjustedHeight = height;

        if (type === "item") {
            adjustedPosition.x += lineWidth;
            adjustedPosition.y += lineWidth;
            adjustedWidth -= lineWidth;
            adjustedHeight -= lineWidth;
        }

        this.add
            .rectangle(adjustedPosition.x, adjustedPosition.y, adjustedWidth, adjustedHeight)
            .setStrokeStyle(lineWidth, color.hex, opacity)
            .setOrigin(0, 0);
    }

    #addDebugText(type: "container" | "item", text: string, position: Phaser.Math.Vector2) {
        const offSet = 2;
        const color = type === "container" ? debugColors.green : debugColors.yellow;

        const textObject = this.add.text(position.x + offSet, position.y + offSet, text, {
            color: color.string,
            fontSize: "14px",
        });

        if (type === "container") {
            textObject.setOrigin(0, 1);
        }
    }

    #hideAlert() {
        this.#alertTimer = 0;
        this.#alertDuration = 0;

        const container = this.#uiContainersByName.get(containerKeys.alerts);
        const item = container.childrenByKey.get(0);
        const gameObject = item.gameObjects;
        if (gameObject) {
            gameObject.destroy();
        }
    }

    #initEventHandlers() {
        // Inputs
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_UP, this.#handleKeyUp, this);
        // Scene events
        gameEvents.on(
            eventKeys.from.enemyWaveManager.updatePanelInfo,
            this.#handleUpdatePanelInfo,
            this
        );
        gameEvents.on(eventKeys.from.gameScene.setTargetFrame, this.#handleSetTargetFrame, this);
        gameEvents.on(eventKeys.to.uiScene.showAlert, this.#handleShowAlert, this);
        gameEvents.on(eventKeys.from.resourceManager.livesChanged, this.#handleLivesChanged, this);
        gameEvents.on(eventKeys.from.resourceManager.goldChanged, this.#handleGoldChanged, this);

        // Remove events on scene shutdown
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off(Phaser.Input.Keyboard.Events.KEY_UP);
            gameEvents.off(eventKeys.from.enemyWaveManager.updatePanelInfo);
            gameEvents.off(eventKeys.from.gameScene.setTargetFrame);
            gameEvents.off(eventKeys.to.uiScene.showAlert);
            gameEvents.off(eventKeys.from.resourceManager.livesChanged);
            gameEvents.off(eventKeys.from.resourceManager.goldChanged);
        });
    }

    #handleKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case "1":
                gameEvents.emit(eventKeys.from.uiScene.activateBuildMode, TowerType.Crossbow);
                break;
        }
    }

    /**
     * Display a text for the defined duration on the screen
     *
     * @param text The text to display
     * @param duration The duration in milliseconds for the alert to be visible. (-1 is infinite)
     */
    #handleShowAlert(text: string, duration: number) {
        this.#alertTimer = 0;
        this.#alertDuration = duration;
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

        const container = this.#uiContainersByName.get(containerKeys.alerts);

        const item = container.childrenByKey.get(0);
        const gameObject = item.gameObjects;
        if (gameObject) {
            gameObject.destroy();
        }

        const gameObjectText = this.add
            .text(screenCenterX, item.position.y, text)
            .setOrigin(0.5, 0);
        item.gameObjects = gameObjectText;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    #handleSetTargetFrame(classType: Function) {
        const container = this.#uiContainersByName.get(containerKeys.targetFrame);

        const item = container.childrenByKey.get(0);
        const gameObject = item.gameObjects;
        if (gameObject) {
            gameObject.destroy();
        }

        container.group = this.add.group({ classType });
        item.gameObjects = container.group
            .get(item.position.x, item.position.x)
            .setPosition(item.position.x, item.position.y)
            .setOrigin(0, 0)
            .setScale(4, 4);

        container.childrenByKey.set(item.key, item);
    }

    #handleUpdatePanelInfo(textFieldUpdates: TextFieldUpdate[]) {
        const container = this.#uiContainersByName.get(containerKeys.panelWaveInfo);
        const { group } = container;

        for (const textFieldUpdate of textFieldUpdates) {
            const textField = container.childrenByKey.get(textFieldUpdate.key);
            if (textField.gameObjects) {
                textField.gameObjects.destroy();
            }

            const textOffsetX = 10;
            const textOffsetY = this.#layerUi.layer.tileHeight / 2;
            const textGameObject = this.add.text(
                textField.position.x + textOffsetX,
                textField.position.y + textOffsetY,
                textFieldUpdate.text,
                {
                    fontSize: container.config.grid.itemsConfig.fontSize,
                }
            );
            textField.gameObjects = textGameObject;
            group.add(textGameObject);
        }
    }

    #handleCLickBuildTowerButton(towerType: TowerType) {
        gameEvents.emit(eventKeys.from.uiScene.activateBuildMode, towerType);
    }

    #handleLivesChanged(lives: number) {
        const container = this.#uiContainersByName.get(containerKeys.lives);
        const item = container.childrenByKey.get(0);
        const text = item.gameObjects as Phaser.GameObjects.Text;

        text.setText(`Lives: ${lives}`);
    }

    #handleGoldChanged(gold: number) {
        const container = this.#uiContainersByName.get(containerKeys.gold);
        const item = container.childrenByKey.get(0);
        const text = item.gameObjects as Phaser.GameObjects.Text;

        text.setText(`Gold: ${gold}`);
    }
}

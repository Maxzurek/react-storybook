import { debugColors } from "../Colors";
import { tiledMapConfig } from "../configs/TiledConfig";
import { eventKeys, sceneEvents } from "../events/EventsCenter";
import { Vector2d } from "../interfaces/Global.interfaces";
import { textureKeys, sceneKeys } from "../Keys";

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
    position: Vector2d;
    gameObject: Phaser.GameObjects.GameObject;
}
interface UiContainer {
    /**
     * The name of the container should be unique
     */
    name: string;
    position: Vector2d;
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
    topLeftTile: Vector2d;
}

const containerKeys = {
    targetFrame: "target-frame",
    panelInfo: "panel-info",
    panelButtons: "panel-buttons",
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
        topLeftTile: { x: 0, y: tiledMapConfig.castle.size.height - uiConfig.height },
    },
    {
        name: containerKeys.panelInfo,
        width: 13,
        height: uiConfig.height,
        topLeftTile: {
            x: 4,
            y: tiledMapConfig.castle.size.height - uiConfig.height,
        },
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
        name: containerKeys.panelButtons,
        width: 4,
        height: uiConfig.height,
        topLeftTile: {
            x: 17,
            y: tiledMapConfig.castle.size.height - uiConfig.height,
        },
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
];

export default class Ui extends Phaser.Scene {
    #tileMapUi: Phaser.Tilemaps.Tilemap;
    #layerUi: Phaser.Tilemaps.TilemapLayer;
    #layerUiBackground: Phaser.Tilemaps.TilemapLayer;
    #uiContainersByName: Map<string, UiContainer> = new Map();

    constructor() {
        super(sceneKeys.ui);
    }

    init() {
        this.#initEventHandlers();
    }

    create() {
        this.#createMap();
        this.#initUiContainers();
        this.#createDebugGraphics();
    }

    #initEventHandlers() {
        sceneEvents.on(eventKeys.uiScene.updatePanelInfo, this.#handleUpdatePanelInfo, this);
        sceneEvents.on(eventKeys.uiScene.setTargetFrame, this.#handleSetTargetFrame, this);

        // Remove events on scene shutdown
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(eventKeys.uiScene.updatePanelInfo);
            sceneEvents.off(eventKeys.uiScene.setTargetFrame);
        });
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

    #initUiContainers() {
        for (const containerConfig of containerConfigs) {
            const { name, topLeftTile } = containerConfig;
            const position = this.#layerUi.tileToWorldXY(topLeftTile.x, topLeftTile.y);
            const childrenByKey = this.#getUiContainerChildrenByKey(containerConfig);
            const container: UiContainer = {
                name,
                position,
                childrenByKey: childrenByKey,
                config: containerConfig,
            };

            this.#uiContainersByName.set(container.name, container);
        }
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
                const position = this.#layerUi.tileToWorldXY(x, y);

                const item: UiItem = {
                    key: indexNumber,
                    gameObject: null,
                    position,
                };

                children.push(item);
                childrenByKey.set(item.key, item);
                indexNumber++;
            }
        }

        return childrenByKey;
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
        position: Vector2d,
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

    #addDebugText(type: "container" | "item", text: string, position: Vector2d) {
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

    // eslint-disable-next-line @typescript-eslint/ban-types
    #handleSetTargetFrame(classType: Function) {
        const targetFrameContainer = this.#uiContainersByName.get(containerKeys.targetFrame);

        const item = targetFrameContainer.childrenByKey.get(0);
        const gameObject = item.gameObject;
        if (gameObject) {
            gameObject.destroy();
        }

        const group = this.add.group({ classType });
        const newGameObject = group
            .get(targetFrameContainer.position.x, targetFrameContainer.position.x)
            .setPosition(targetFrameContainer.position.x, targetFrameContainer.position.y)
            .setOrigin(0, 0)
            .setScale(4, 4);

        targetFrameContainer.childrenByKey.set(item.key, newGameObject);
    }

    #handleUpdatePanelInfo(textFieldUpdates: TextFieldUpdate[]) {
        const panelInfo = this.#uiContainersByName.get(containerKeys.panelInfo);
        for (const textFieldUpdate of textFieldUpdates) {
            const textField = panelInfo.childrenByKey.get(textFieldUpdate.key);
            if (textField.gameObject) {
                textField.gameObject.destroy();
            }

            const textOffsetX = 10;
            const textOffsetY = this.#layerUi.layer.tileHeight / 2;
            const textGameObject = this.add.text(
                textField.position.x + textOffsetX,
                textField.position.y + textOffsetY,
                textFieldUpdate.text,
                {
                    fontSize: panelInfo.config.grid.itemsConfig.fontSize,
                }
            );
            textField.gameObject = textGameObject;
        }
    }
}

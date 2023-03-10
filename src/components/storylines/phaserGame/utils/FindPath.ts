import Phaser from "phaser";

interface TilePosition {
    x: number;
    y: number;
}

const toKey = (x: number, y: number) => `${x}x${y}`;

const findPath = (
    start: Phaser.Math.Vector2,
    target: Phaser.Math.Vector2,
    layerGround: Phaser.Tilemaps.TilemapLayer,
    layerWallOne: Phaser.Tilemaps.TilemapLayer,
    layerProps: Phaser.Tilemaps.TilemapLayer
) => {
    if (!layerGround.getTileAt(target.x, target.y)) {
        return [];
    }
    if (layerWallOne.getTileAt(target.x, target.y)) {
        return [];
    }
    if (layerProps.getTileAt(target.x, target.y)) {
        return [];
    }

    const queue: TilePosition[] = [];
    const parentForKey: { [key: string]: { key: string; position: TilePosition } } = {};

    const startKey = toKey(start.x, start.y);
    const targetKey = toKey(target.x, target.y);

    parentForKey[startKey] = {
        key: "",
        position: { x: -1, y: -1 },
    };

    queue.push(start);

    while (queue.length > 0) {
        const { x, y } = queue.shift();
        const currentKey = toKey(x, y);

        if (currentKey === targetKey) {
            break;
        }

        const neighbors = [
            { x, y: y - 1 }, // top
            { x: x + 1, y }, // right
            { x, y: y + 1 }, // bottom
            { x: x - 1, y }, // left
        ];

        for (let i = 0; i < neighbors.length; ++i) {
            const neighbor = neighbors[i];
            const tile = layerGround.getTileAt(neighbor.x, neighbor.y);

            if (!tile) {
                continue;
            }

            if (layerWallOne.hasTileAt(neighbor.x, neighbor.y)) {
                continue;
            }

            if (layerProps.hasTileAt(neighbor.x, neighbor.y)) {
                continue;
            }

            const key = toKey(neighbor.x, neighbor.y);

            if (key in parentForKey) {
                continue;
            }

            parentForKey[key] = {
                key: currentKey,
                position: { x, y },
            };

            queue.push(neighbor);
        }
    }

    return getPath(startKey, targetKey, parentForKey, layerGround);
};

/**
 * The bulk of the code is a basic breadth-first search implementation using just the 4-way north, south, east, and west neighbors.
 * Each neighbor is added to the parentForKey lookup table with the current tile as the parent.
 */
const getPath = (
    startKey: string,
    targetKey: string,
    parentForKey: { [key: string]: { key: string; position: TilePosition } },
    layerGround: Phaser.Tilemaps.TilemapLayer
) => {
    const path: Phaser.Math.Vector2[] = [];

    let currentKey = targetKey;
    let currentPos = parentForKey[targetKey].position;

    while (currentKey !== startKey) {
        const pos = layerGround.tileToWorldXY(currentPos.x, currentPos.y);
        pos.x += layerGround.tilemap.tileWidth * 0.5;
        pos.y += layerGround.tilemap.tileHeight * 0.5;

        path.push(pos);

        const { key, position } = parentForKey[currentKey];
        currentKey = key;
        currentPos = position;
    }

    return path.reverse();
};

export default findPath;

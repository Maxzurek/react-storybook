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

            if (layerWallOne.getTileAt(neighbor.x, neighbor.y)) {
                continue;
            }

            if (layerProps.getTileAt(neighbor.x, neighbor.y)) {
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

    let path = getPath(startKey, targetKey, parentForKey, layerGround);
    if (path.length) {
        path = addTargetPositionToPath(target, path, layerGround);
    }

    return path;
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
    const parent = parentForKey[targetKey];

    if (!parent) return path;

    let currentKey = targetKey;
    let currentPos = parentForKey[targetKey].position;

    while (currentKey !== startKey) {
        const pos = layerGround.tileToWorldXY(currentPos.x, currentPos.y);
        pos.x += layerGround.tilemap.tileWidth / 2;
        pos.y += layerGround.tilemap.tileHeight / 2;

        path.push(pos);

        const { key, position } = parentForKey[currentKey];
        currentKey = key;
        currentPos = position;
    }

    return path.reverse();
};

const addTargetPositionToPath = (
    target: Phaser.Math.Vector2,
    path: Phaser.Math.Vector2[],
    layerGround: Phaser.Tilemaps.TilemapLayer
) => {
    const newPath = [...path];
    const targetPosition = layerGround.tileToWorldXY(target.x, target.y);

    targetPosition.x += layerGround.tilemap.tileWidth / 2;
    targetPosition.y += layerGround.tilemap.tileHeight / 2;
    newPath.push(targetPosition);

    return newPath;
};

export default findPath;

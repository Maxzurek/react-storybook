export enum MapNames {
    Castle,
}

export interface SpriteLayers {
    walkable: Phaser.Tilemaps.TilemapLayer;
    unWalkable: Phaser.Tilemaps.TilemapLayer[];
}

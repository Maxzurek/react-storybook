export default class GameUtils {
    static worldPositionToTileXY(x: number, y: number, layer: Phaser.Tilemaps.TilemapLayer) {
        const yOffset = -12.125;
        return layer.worldToTileXY(x, y + yOffset);
    }
}

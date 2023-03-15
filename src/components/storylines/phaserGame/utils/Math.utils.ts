export default class MathUtils {
    static secondsToMilliseconds(seconds: number) {
        return seconds * 1000;
    }

    static millisecondsToSeconds(milliseconds: number) {
        return milliseconds / 1000;
    }

    static getDistanceBetween(pointA: Phaser.Math.Vector2, pointB: Phaser.Math.Vector2) {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }
}

export enum VectorDirection {
    DownRight,
    DownLeft,
    UpLeft,
    UpRight,
    Left,
    Right,
    Up,
    Down,
}

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

    static getVectorDirectionFromAngle(angleDegree: number) {
        if (angleDegree === 0) {
            return VectorDirection.Right;
        } else if (angleDegree === 90) {
            return VectorDirection.Down;
        } else if (angleDegree === -180) {
            return VectorDirection.Left;
        } else if (angleDegree === -90) {
            return VectorDirection.Up;
        } else if (angleDegree >= 0 && angleDegree <= 90) {
            return VectorDirection.DownRight;
        } else if (angleDegree > 90 && angleDegree <= 180) {
            return VectorDirection.DownLeft;
        } else if (angleDegree >= -180 && angleDegree <= -90) {
            return VectorDirection.UpLeft;
        } else if (angleDegree > -90 && angleDegree < 0) {
            return VectorDirection.UpRight;
        }
    }

    static getAngleDegreeBetween(pointA: Phaser.Math.Vector2, pointB: Phaser.Math.Vector2) {
        const angleRadian = Phaser.Math.Angle.BetweenPoints(pointA, pointB);
        return Phaser.Math.RadToDeg(angleRadian);
    }

    static getVelocityVectorFrom(
        pointA: Phaser.Math.Vector2,
        pointB: Phaser.Math.Vector2,
        speed: number
    ) {
        const angleRadian = Phaser.Math.Angle.BetweenPoints(pointA, pointB);
        const vectorDirection = MathUtils.getVectorDirectionFromAngle(angleRadian);
        const velocityX = Math.cos(Math.abs(angleRadian)) * speed;
        const velocityY = Math.sin(Math.abs(angleRadian)) * speed;
        const velocityVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(velocityX, velocityY);

        switch (vectorDirection) {
            case VectorDirection.Right:
                velocityVector.x *= Phaser.Math.Vector2.RIGHT.x;
                velocityVector.y *= Phaser.Math.Vector2.RIGHT.y;
                break;
            case VectorDirection.Down:
                velocityVector.x *= Phaser.Math.Vector2.DOWN.x;
                velocityVector.y *= Phaser.Math.Vector2.DOWN.y;
                break;
            case VectorDirection.Left:
                velocityVector.x *= Phaser.Math.Vector2.LEFT.x;
                velocityVector.y *= Phaser.Math.Vector2.LEFT.y;
                break;
            case VectorDirection.Up:
                velocityVector.x *= Phaser.Math.Vector2.UP.x;
                velocityVector.y *= Phaser.Math.Vector2.UP.y;
                break;
            case VectorDirection.DownRight:
                velocityVector.x *= Phaser.Math.Vector2.RIGHT.x;
                velocityVector.y *= Phaser.Math.Vector2.DOWN.y;
                break;
            case VectorDirection.DownLeft:
                velocityVector.x *= Phaser.Math.Vector2.LEFT.x;
                velocityVector.y *= Phaser.Math.Vector2.DOWN.y;
                break;
            case VectorDirection.UpLeft:
                velocityVector.x *= Phaser.Math.Vector2.LEFT.x;
                velocityVector.y *= Phaser.Math.Vector2.UP.y;
                break;
            case VectorDirection.UpRight:
                velocityVector.x *= Phaser.Math.Vector2.RIGHT.x;
                velocityVector.y *= Phaser.Math.Vector2.UP.y;
                break;
        }

        return velocityVector;
    }
}

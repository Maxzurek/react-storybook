import { eventKeys, gameEvents } from "../events/EventsCenter";
import { SpriteType } from "../interfaces/Sprite.interfaces";
import PathUtils from "../utils/Path.utils";

export enum MoveDirection {
    Left,
    Right,
    Up,
    Down,
    Idle,
}

export default class Sprite extends Phaser.Physics.Arcade.Sprite {
    protected spriteTextureFrames: number[] = [];
    protected speed: number;
    protected path: Phaser.Math.Vector2[] = [];
    protected pathFinalTargetTilePosition: Phaser.Math.Vector2;
    protected walkableLayer: Phaser.Tilemaps.TilemapLayer;
    protected unWalkableLayers: Phaser.Tilemaps.TilemapLayer[];
    #nextPathWorldTarget: Phaser.Math.Vector2;
    protected stopPathInFontOfTarget = false;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.#moveIfNeeded();
    }

    resetPath() {
        this.path = [];
        this.pathFinalTargetTilePosition = null;
        this.#nextPathWorldTarget = null;
        this.stopPathInFontOfTarget = false;
    }

    findPathAndMoveTo(
        targetTile: Phaser.Math.Vector2,
        config: {
            walkableLayer: Phaser.Tilemaps.TilemapLayer;
            unWalkableLayers: Phaser.Tilemaps.TilemapLayer[];
            stopPathInFrontOfTarget?: boolean;
        }
    ) {
        if (!targetTile) return;

        const { walkableLayer, unWalkableLayers, stopPathInFrontOfTarget } = config;
        this.walkableLayer = walkableLayer;
        this.unWalkableLayers = unWalkableLayers;
        this.stopPathInFontOfTarget = stopPathInFrontOfTarget;

        const startTile = walkableLayer.worldToTileXY(this.x, this.y);
        const path = PathUtils.findPath(startTile, targetTile, {
            walkableLayer,
            unWalkableLayers,
            stopPathInFrontOfTarget,
        });

        if (this.type === SpriteType.Enemy && !path.length) {
            const pathCopy = [...this.path];
            this.resetPath();
            gameEvents.emit(eventKeys.from.enemy.pathBlocked, this, pathCopy);
            return;
        }

        if (!path.length) return;

        if (this.type === SpriteType.Player && this.#nextPathWorldTarget) {
            gameEvents.emit(eventKeys.from.player.pathChanged);
        }

        this.path = path;
        const pathTargetTileWorldPosition = this.path.at(-1);
        const pathTargetTilePosition = walkableLayer.worldToTileXY(
            pathTargetTileWorldPosition.x,
            pathTargetTileWorldPosition.y
        );
        this.pathFinalTargetTilePosition = pathTargetTilePosition;

        this.#moveTo(this.path.shift());
    }

    protected isPathFinalDestinationReached() {
        if (!this.pathFinalTargetTilePosition) return false;

        const worldPosition = new Phaser.Math.Vector2(this.x, this.y);
        const tilePosition = this.walkableLayer?.worldToTileXY(worldPosition.x, worldPosition.y);
        const isPathFinalDestinationReached =
            tilePosition.x === this.pathFinalTargetTilePosition.x &&
            tilePosition.y === this.pathFinalTargetTilePosition.y;

        return isPathFinalDestinationReached;
    }

    #moveTo(targetTile: Phaser.Math.Vector2) {
        this.#nextPathWorldTarget = targetTile;
    }

    #getMoveDirection() {
        const deltaOffset = 5;
        let deltaX = 0;
        let deltaY = 0;

        if (this.#nextPathWorldTarget) {
            deltaX = this.#nextPathWorldTarget.x - this.x;
            deltaY = this.#nextPathWorldTarget.y - this.y;

            if (Math.abs(deltaX) < deltaOffset) {
                deltaX = 0;
            }
            if (Math.abs(deltaY) < deltaOffset) {
                deltaY = 0;
            }

            if (deltaX === 0 && deltaY === 0) {
                if (this.path.length > 0) {
                    this.#moveTo(this.path.shift());
                    return;
                }
            }
        }

        let moveDirection: MoveDirection = MoveDirection.Idle;

        if (deltaX < 0) {
            moveDirection = MoveDirection.Left;
        }
        if (deltaX > 0) {
            moveDirection = MoveDirection.Right;
        }
        if (deltaY < 0) {
            moveDirection = MoveDirection.Up;
        }
        if (deltaY > 0) {
            moveDirection = MoveDirection.Down;
        }

        return moveDirection;
    }

    #moveIfNeeded() {
        const moveDirection = this.#getMoveDirection();

        switch (moveDirection) {
            case MoveDirection.Left:
                this.setVelocity(-this.speed, 0);
                this.flipX = true;
                break;
            case MoveDirection.Right:
                this.setVelocity(this.speed, 0);
                this.flipX = false;
                break;
            case MoveDirection.Up:
                this.setVelocity(0, -this.speed);
                break;
            case MoveDirection.Down:
                this.setVelocity(0, this.speed);
                break;
            case MoveDirection.Idle:
                this.setVelocity(0, 0);
                break;
        }

        this.animateSpriteMovement(moveDirection);
    }

    animateSpriteMovement(_moveDirection: MoveDirection) {
        const message = "Sprite - Abstract method 'animateCharacterMovement' must be implemented.";
        console.log(message);
        throw new Error(message);
    }
}

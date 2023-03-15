import { eventKeys, sceneEvents } from "../events/EventsCenter";
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
    protected targetTile: Phaser.Math.Vector2;
    protected movePath: Phaser.Math.Vector2[] = [];
    protected moveToWorldTarget: Phaser.Math.Vector2;
    protected walkableLayer: Phaser.Tilemaps.TilemapLayer;
    protected unWalkableLayers: Phaser.Tilemaps.TilemapLayer[];
    #isValidateMovePathRequired = false;
    #pathUpdateTimer = 0;
    #pathUpdateDelay = 100;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.#initEventsHandlers();
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        this.#pathUpdateTimer += delta;
        if (this.type === SpriteType.Enemy && this.#isValidateMovePathRequired) {
            this.#isValidateMovePathRequired = false;
            this.#validateMovePath();
        }

        this.#moveIfNeeded();
    }

    findPathAndMoveTo(
        targetTile: Phaser.Math.Vector2,
        walkableLayer: Phaser.Tilemaps.TilemapLayer,
        unWalkableLayers: Phaser.Tilemaps.TilemapLayer[]
    ) {
        this.targetTile = targetTile;
        this.walkableLayer = walkableLayer;
        this.unWalkableLayers = unWalkableLayers;

        const startTile = walkableLayer.worldToTileXY(this.x, this.y);
        const path = PathUtils.findPath(startTile, targetTile, {
            walkableLayer,
            unWalkableLayers,
        });

        if (!path || path.length <= 0) {
            this.movePath = [];
            this.moveToWorldTarget = null;
            console.log("findPathAndMoveTo - Path blocked");
            // TODO Attack closest tower if path is blocked
            return;
        }

        this.movePath = path;
        this.#moveTo(this.movePath.shift());
    }

    #validateMovePath() {
        if (!this.movePath.length) return;

        const targetWorldPosition = this.movePath[this.movePath.length - 1];
        const targetTile = this.walkableLayer.worldToTileXY(
            targetWorldPosition.x,
            targetWorldPosition.y
        );

        this.findPathAndMoveTo(targetTile, this.walkableLayer, this.unWalkableLayers);
    }

    #moveTo(target: Phaser.Math.Vector2) {
        this.moveToWorldTarget = target;
    }

    #getMoveDirection() {
        const deltaOffset = 5;
        let deltaX = 0;
        let deltaY = 0;

        if (this.moveToWorldTarget) {
            deltaX = this.moveToWorldTarget.x - this.x;
            deltaY = this.moveToWorldTarget.y - this.y;

            if (Math.abs(deltaX) < deltaOffset) {
                deltaX = 0;
            }
            if (Math.abs(deltaY) < deltaOffset) {
                deltaY = 0;
            }

            if (deltaX === 0 && deltaY === 0) {
                if (this.movePath.length > 0) {
                    this.#moveTo(this.movePath.shift());
                    return;
                }

                this.moveToWorldTarget = null;
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

    #initEventsHandlers() {
        sceneEvents.on(eventKeys.gameScene.towerAdded, this.#handleGameSceneTowerAdded, this);
        this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(eventKeys.gameScene.towerAdded);
        });
    }

    #handleGameSceneTowerAdded() {
        this.#isValidateMovePathRequired = true;
    }

    animateSpriteMovement(_moveDirection: MoveDirection) {
        throw new Error("Method 'animateCharacterMovement' must be implemented.");
    }
}

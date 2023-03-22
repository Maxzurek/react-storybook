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
    protected finalPathTileTarget: Phaser.Math.Vector2;
    protected path: Phaser.Math.Vector2[] = [];
    protected nextPathWorldTarget: Phaser.Math.Vector2;
    protected walkableLayer: Phaser.Tilemaps.TilemapLayer;
    protected unWalkableLayers: Phaser.Tilemaps.TilemapLayer[];
    #stopPathInFontOfTarget = false;
    #isValidateMovePathRequired = false;

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

        if (this.type === SpriteType.Enemy && this.#isValidateMovePathRequired) {
            this.#isValidateMovePathRequired = false;
            this.#validateMovePath();
        }

        this.#moveIfNeeded();
    }

    resetPath() {
        this.finalPathTileTarget = null;
        this.path = [];
        this.nextPathWorldTarget = null;
        this.#stopPathInFontOfTarget = false;
        this.#isValidateMovePathRequired = false;
    }

    findPathAndMoveTo(
        targetTile: Phaser.Math.Vector2,
        config: {
            walkableLayer: Phaser.Tilemaps.TilemapLayer;
            unWalkableLayers: Phaser.Tilemaps.TilemapLayer[];
            stopPathInFrontOfTarget?: boolean;
        }
    ) {
        const { walkableLayer, unWalkableLayers, stopPathInFrontOfTarget } = config;

        this.finalPathTileTarget = targetTile;
        this.walkableLayer = walkableLayer;
        this.unWalkableLayers = unWalkableLayers;
        this.#stopPathInFontOfTarget = stopPathInFrontOfTarget;

        const startTile = walkableLayer.worldToTileXY(this.x, this.y);
        const path = PathUtils.findPath(startTile, targetTile, {
            walkableLayer,
            unWalkableLayers,
            stopPathInFrontOfTarget,
        });

        if (path.length <= 0) {
            this.path = [];
            this.nextPathWorldTarget = null;
            console.log("findPathAndMoveTo - Path blocked");
            // TODO Attack closest tower if path is blocked
            return;
        }

        if (this.nextPathWorldTarget) {
            gameEvents.emit(eventKeys.from.sprite.pathChanged, this);
        }

        this.path = path;
        this.#moveTo(this.path.shift());
    }

    #validateMovePath() {
        if (!this.path.length) return;

        const targetWorldPosition = this.path[this.path.length - 1];
        const targetTile = this.walkableLayer.worldToTileXY(
            targetWorldPosition.x,
            targetWorldPosition.y
        );

        this.findPathAndMoveTo(targetTile, {
            walkableLayer: this.walkableLayer,
            unWalkableLayers: this.unWalkableLayers,
            stopPathInFrontOfTarget: this.#stopPathInFontOfTarget,
        });
    }

    #moveTo(target: Phaser.Math.Vector2) {
        this.nextPathWorldTarget = target;
    }

    #getMoveDirection() {
        const deltaOffset = 5;
        let deltaX = 0;
        let deltaY = 0;

        if (this.nextPathWorldTarget) {
            deltaX = this.nextPathWorldTarget.x - this.x;
            deltaY = this.nextPathWorldTarget.y - this.y;

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

                gameEvents.emit(eventKeys.from.sprite.pathTargetReached, this);
                this.resetPath();
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
        gameEvents.on(eventKeys.from.gameScene.towerAdded, this.#handleGameSceneTowerAdded, this);
        this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameEvents.off(eventKeys.from.gameScene.towerAdded);
        });
    }

    #handleGameSceneTowerAdded() {
        this.#isValidateMovePathRequired = true;
    }

    animateSpriteMovement(_moveDirection: MoveDirection) {
        const message = "Sprite - Abstract method 'animateCharacterMovement' must be implemented.";
        console.log(message);
        throw new Error(message);
    }
}

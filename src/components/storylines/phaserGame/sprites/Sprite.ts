import { PathConfig } from "../utils/Path.utils";

export enum MoveDirection {
    Left,
    Right,
    Up,
    Down,
    Idle,
}

export interface PathState {
    path: Phaser.Math.Vector2[];
    finalTargetTilePosition: Phaser.Math.Vector2;
    nextTargetWorldPosition: Phaser.Math.Vector2;
    config: PathConfig;
    closestTowerTilePosition?: Phaser.Math.Vector2;
    isPathBlocked?: boolean;
}

export default class Sprite extends Phaser.Physics.Arcade.Sprite {
    protected spriteTextureFrames: number[] = [];
    protected speed: number;
    protected pathState: PathState = {
        path: [],
        finalTargetTilePosition: null,
        nextTargetWorldPosition: null,
        config: null,
        closestTowerTilePosition: null,
        isPathBlocked: false,
    };

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
    }

    protected getMoveDirection() {
        const deltaOffset = 5;
        let deltaX = 0;
        let deltaY = 0;

        if (this.pathState.nextTargetWorldPosition) {
            deltaX = this.pathState.nextTargetWorldPosition.x - this.x;
            deltaY = this.pathState.nextTargetWorldPosition.y - this.y;

            if (Math.abs(deltaX) < deltaOffset) {
                deltaX = 0;
            }
            if (Math.abs(deltaY) < deltaOffset) {
                deltaY = 0;
            }

            if (deltaX === 0 && deltaY === 0) {
                if (this.pathState.path.length > 0) {
                    this.pathState.nextTargetWorldPosition = this.pathState.path.shift();
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

    protected moveSpiteAlongPath() {
        const moveDirection = this.getMoveDirection();

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

    protected isPathFinalDestinationReached() {
        if (!this.pathState.finalTargetTilePosition || !this.pathState.config) return false;

        const { finalTargetTilePosition } = this.pathState;
        const worldPosition = new Phaser.Math.Vector2(this.x, this.y);
        const tilePosition = this.pathState.config.walkableLayer?.worldToTileXY(
            worldPosition.x,
            worldPosition.y
        );

        return (
            tilePosition.x === finalTargetTilePosition.x &&
            tilePosition.y === finalTargetTilePosition.y
        );
    }

    protected animateSpriteMovement(_moveDirection: MoveDirection) {
        const message = "Sprite - Abstract method 'animateCharacterMovement' must be implemented.";
        console.log(message);
        throw new Error(message);
    }
}

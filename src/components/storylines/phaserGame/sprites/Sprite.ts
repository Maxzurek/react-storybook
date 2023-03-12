export enum MoveDirection {
    Left,
    Right,
    Up,
    Down,
    Idle,
}

export default class Sprite extends Phaser.Physics.Arcade.Sprite {
    protected spriteTextureFrames = [124, 125, 126, 127];
    protected speed = 200;
    protected movePath: Phaser.Math.Vector2[] = [];
    protected moveToTarget: Phaser.Math.Vector2;

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

    moveAlong(path: Phaser.Math.Vector2[]) {
        if (!path || path.length <= 0) {
            return;
        }

        this.movePath = path;
        this.#moveTo(this.movePath.shift());
    }

    #moveTo(target: Phaser.Math.Vector2) {
        this.moveToTarget = target;
    }

    #getMoveDirection() {
        const deltaOffset = 2;
        let deltaX = 0;
        let deltaY = 0;

        if (this.moveToTarget) {
            deltaX = this.moveToTarget.x - this.x;
            deltaY = this.moveToTarget.y - this.y;

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

                this.moveToTarget = null;
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
        throw new Error("Method 'animateCharacterMovement' must be implemented.");
    }
}

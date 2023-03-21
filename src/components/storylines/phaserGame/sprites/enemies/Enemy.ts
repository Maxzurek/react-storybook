import ComponentService from "../../components/ComponentService";
import TowerTargetComponent from "../../components/debug/TowerTargetComponent";
import LifeBarComponent from "../../components/ui/LifeBarComponent";
import { enemyEvents, eventKeys } from "../../events/EventsCenter";
import { ArmorType, ResistanceType, SpriteType } from "../../interfaces/Sprite.interfaces";
import { animationKeys, textureKeys } from "../../Keys";
import Sprite, { MoveDirection } from "../Sprite";

enum HealthState {
    Alive,
    Dead,
}

export default class Enemy extends Sprite {
    protected health = 0;
    protected maxHealth = 0;
    protected armor = 0;
    protected armorType: ArmorType = ArmorType.Light;
    protected resistanceType: ResistanceType = ResistanceType.None;
    protected healthState = HealthState.Alive;
    #components = new ComponentService();

    constructor(
        spriteTextureFrames: number[],
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.maxHealth = this.health;
        this.type = SpriteType.Enemy;
        this.spriteTextureFrames = spriteTextureFrames;
        this.#components.addComponent(this, new LifeBarComponent());
        this.#components.addComponent(this, new TowerTargetComponent());
        this.setFrame(this.spriteTextureFrames[0]);
        this.#createAnimations();
        this.anims.play(animationKeys.enemy.idle);
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.healthState === HealthState.Dead) {
            enemyEvents.emit(eventKeys.enemy.died);
            this.destroy();
            return;
        }
        if (this.#isFinalDestinationReached()) {
            enemyEvents.emit(eventKeys.enemy.finalDestinationReached);
            this.destroy();
            return;
        }

        this.#components.update(time, delta);
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);

        this.#components.destroy();
    }

    getSpeed() {
        return this.speed;
    }

    setTowerTargetVisibility(isVisible: boolean) {
        const component = this.#components.findComponent(this, TowerTargetComponent);
        component.setVisible(isVisible);
    }

    takeDamage(amount: number) {
        const newHealth = Math.max(0, this.health - amount);
        this.health = newHealth;

        if (this.health === 0) {
            this.healthState = HealthState.Dead;
        }

        const lifeBar = this.#components.findComponent(this, LifeBarComponent);
        const lifePercentageRemaining = this.health / this.maxHealth;
        lifeBar.updateFillPercentage(lifePercentageRemaining);
    }

    #createAnimations() {
        this.anims.create({
            key: animationKeys.enemy.idle,
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                frames: [this.spriteTextureFrames[1], this.spriteTextureFrames[3]],
            }),
            repeat: -1,
        });
        this.anims.create({
            key: animationKeys.enemy.walk,
            frameRate: 12,
            frames: this.anims.generateFrameNumbers(textureKeys.sprites, {
                start: this.spriteTextureFrames[0],
                end: this.spriteTextureFrames[3],
            }),
            repeat: -1,
        });
    }

    #isFinalDestinationReached() {
        const worldPosition = new Phaser.Math.Vector2(this.x, this.y);
        const tilePosition = this.walkableLayer?.worldToTileXY(worldPosition.x, worldPosition.y);
        const isFinalDestinationReached =
            tilePosition.x === this.finalPathTileTarget.x &&
            tilePosition.y === this.finalPathTileTarget.y;

        return isFinalDestinationReached;
    }

    animateSpriteMovement(moveDirection: MoveDirection): void {
        if (moveDirection === MoveDirection.Idle) {
            this.anims.play(animationKeys.enemy.idle, true);
        } else {
            this.anims.play(animationKeys.enemy.walk, true);
        }
    }
}

import { eventKeys, gameEvents } from "../events/EventsCenter";
import Enemy from "../sprites/enemies/Enemy";
import Tower from "../sprites/towers/Tower";

export default class ResourceManager {
    #gameScene: Phaser.Scene;
    #gold: number;
    #lives: number;

    constructor(gameScene: Phaser.Scene) {
        this.#gameScene = gameScene;

        this.#gold = 100;
        this.#lives = 20;

        this.#initEventHandlers();
    }

    getRemainingLives() {
        return this.#lives;
    }

    getAvailableGold() {
        return this.#gold;
    }

    hasEnoughGold(cost: number) {
        return this.#gold >= cost;
    }

    #initEventHandlers() {
        gameEvents.on(
            eventKeys.from.enemy.finalDestinationReached,
            this.#handleEnemyFinalDestinationReached,
            this
        );
        gameEvents.on(eventKeys.from.gameScene.towerAdded, this.#handleTowerAdded, this);
        gameEvents.on(eventKeys.from.enemy.died, this.#handleEnemyDied, this);
        this.#gameScene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameEvents.off(eventKeys.from.enemy.finalDestinationReached);
        });
    }

    #handleEnemyFinalDestinationReached() {
        if (this.#lives === 0) return;

        --this.#lives;

        gameEvents.emit(eventKeys.from.resourceManager.livesChanged, this.#lives);

        if (this.#lives === 0) {
            gameEvents.emit(eventKeys.from.resourceManager.noLivesRemaining);
        }
    }

    #handleTowerAdded(tower: Tower) {
        const goldCost = tower.getGoldCost();

        if (goldCost > this.#gold) {
            console.error(`ResourceManager - Remaining gold: ${
                this.#gold
            } is not enough to build a tower costing ${goldCost} gold. 
            Make sure to use hasEnoughGold from the ResourceManager before building a new tower.`);
        }

        this.#gold -= goldCost;

        gameEvents.emit(eventKeys.from.resourceManager.goldChanged, this.#gold);
    }

    #handleEnemyDied(enemy: Enemy) {
        this.#gold += enemy.getGoldValue();

        gameEvents.emit(eventKeys.from.resourceManager.goldChanged, this.#gold);
    }
}

import { eventKeys, gameEvents } from "../events/EventsCenter";
import Tower from "../sprites/towers/Tower";

export default class ResourceManager {
    #gameScene: Phaser.Scene;
    #gold: number;
    #remainingLives: number;

    constructor(gameScene: Phaser.Scene) {
        this.#gameScene = gameScene;

        this.#gold = 100;
        this.#remainingLives = 10;

        this.#initEventHandlers();
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
        this.#gameScene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameEvents.off(eventKeys.from.enemy.finalDestinationReached);
        });
    }

    #handleEnemyFinalDestinationReached() {
        if (this.#remainingLives === 0) return;

        --this.#remainingLives;

        if (this.#remainingLives === 0) {
            gameEvents.emit(eventKeys.from.resourceManager.noLivesRemaining);
        }
    }

    #handleTowerAdded(tower: Tower) {
        const goldCost = tower.getGoldCost();

        if (goldCost > this.#gold) {
            throw new Error(
                `ResourceManager - Remaining gold: ${
                    this.#gold
                } is not enough to build a tower costing ${goldCost} gold. 
                Make sure to use hasEnoughGold from the ResourceManager before building a new tower.`
            );
        }

        this.#gold -= goldCost;
    }
}

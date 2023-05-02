import { TowerType } from "../../interfaces/Sprite.interfaces";
import TowerCrossbow from "./TowerCrossbow";

export default class TowerFactory {
    #towerType: TowerType;
    #scene: Phaser.Scene;

    constructor(towerType: TowerType, scene: Phaser.Scene) {
        this.#towerType = towerType;
        this.#scene = scene;
    }

    create() {
        switch (this.#towerType) {
            case TowerType.Crossbow:
                return new TowerCrossbow(this.#scene, 0, 0);
        }
    }
}

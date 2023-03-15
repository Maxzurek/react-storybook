import { TowerType } from "../../interfaces/Sprite.interfaces";
import MathUtils from "../../utils/Math.utils";
import Tower from "./Tower";

export default class TowerCrossbow extends Tower {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number
    ) {
        const range = 100;
        super(range, scene, x, y, texture, frame);

        this.damage = 25;
        this.towerType = TowerType.Crossbow;
        this.attackSpeed = MathUtils.secondsToMilliseconds(1);
    }
}

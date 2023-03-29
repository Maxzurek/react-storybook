import { TowerType } from "../../interfaces/Sprite.interfaces";
import { textureKeys } from "../../Keys";
import MathUtils from "../../utils/Math.utils";
import WeaponTowerCrossbow from "../weapons/WeaponTowerCrossbow";
import Tower from "./Tower";

export default class TowerCrossbow extends Tower {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        const texture = textureKeys.towers.crossbow;
        const range = 100;

        super(range, scene, x, y, texture);

        this.towerType = TowerType.Crossbow;
        this.damage = 10;
        this.buildTime = MathUtils.secondsToMilliseconds(1);
        this.attackDelay = MathUtils.secondsToMilliseconds(1);
        this.goldCost = 1;
    }

    createWeapon() {
        this.weapon = new WeaponTowerCrossbow(this, this.scene, this.x, this.y);
        this.scene.add.existing(this.weapon);
    }
}

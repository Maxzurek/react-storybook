import { TowerType } from "../../interfaces/Sprite.interfaces";
import MathUtils from "../../utils/Math.utils";
import WeaponTowerCrossbow from "../weapons/WeaponTowerCrossbow";
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
        this.attackDelay = MathUtils.secondsToMilliseconds(1);
    }

    createWeapon() {
        // TODO Add level 2 and 3 weapons? Do we really want to upgrade towers/weapons?
        this.weapons = this.scene.add.group({
            runChildUpdate: true,
            classType: WeaponTowerCrossbow,
        });
        this.weapons.get(this.x, this.y);
    }
}

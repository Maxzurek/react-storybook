import { textureKeys } from "../../Keys";
import ProjectileTowerCrossbow from "../projectiles/ProjectileTowerCrossbow";
import Weapon from "./Weapon";

export default class WeaponTowerCrossbow extends Weapon {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        const texture = textureKeys.weapons.crossbow;
        const textureFrames = [0, 1, 2, 3, 4, 5];
        const reloadAnimationFrames = [2, 3, 4, 5, 0];
        const frame = textureFrames[0];

        super(textureFrames, reloadAnimationFrames, scene, x, y, texture, frame);
    }

    createProjectileGroup() {
        this.projectiles = this.scene.physics.add.group({
            runChildUpdate: true,
            classType: ProjectileTowerCrossbow,
        });
    }
}

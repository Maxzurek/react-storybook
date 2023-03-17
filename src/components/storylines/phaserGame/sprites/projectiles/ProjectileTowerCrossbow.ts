import { textureKeys } from "../../Keys";
import Projectile from "./Projectile";

export default class ProjectileTowerCrossbow extends Projectile {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        const animationFrames = [0, 1, 2];
        const texture = textureKeys.projectiles.crossbow;
        const frame = 0;

        super(animationFrames, scene, x, y, texture, frame);

        this.speed = 400;
    }
}

import { debugColors } from "../../Colors";
import { IComponent } from "../ComponentService";

export default class TowerTargetComponent implements IComponent {
    #gameObject: Phaser.GameObjects.GameObject;
    #targetRect: Phaser.GameObjects.Rectangle;

    init(gameObject: Phaser.GameObjects.GameObject) {
        this.#gameObject = gameObject;
    }

    start() {
        this.#createTargetFrame();
    }

    update() {
        const { x, y } = this.#gameObject as Phaser.Physics.Arcade.Sprite;

        this.#targetRect.x = x;
        this.#targetRect.y = y;
    }

    destroy() {
        this.#targetRect.destroy();
    }

    setVisible(isVisible: boolean) {
        this.#targetRect.setVisible(isVisible);
    }

    #createTargetFrame() {
        const { scene, width, height, x, y } = this.#gameObject as Phaser.Physics.Arcade.Sprite;
        const fillAlpha = 0.2;

        this.#targetRect = scene.add.rectangle(x, y, width, height, debugColors.red.hex, fillAlpha);
        this.#targetRect.setVisible(false);
    }
}

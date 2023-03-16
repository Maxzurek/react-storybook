import depthLevels from "../../scenes/DepthLevels";
import { IComponent } from "../ComponentService";

export default class LifeBarComponent implements IComponent {
    #gameObject: Phaser.GameObjects.GameObject;
    #graphics: Phaser.GameObjects.Graphics;
    #width: number;
    #fillStyle = 0x48ed1f;
    height = 4;
    #prevFillPercentage = 1;
    #fillPercentage = 1;

    init(gameObject: Phaser.GameObjects.GameObject) {
        this.#gameObject = gameObject;
    }

    start() {
        this.#addGraphics();
    }

    update() {
        if (!this.#graphics) {
            return;
        }

        const { body, width } = this.#gameObject as Phaser.Physics.Arcade.Sprite;

        if (this.#fillPercentage !== this.#prevFillPercentage) {
            this.#graphics.destroy();
            this.#addGraphics();
        }

        const offsetX = 0.125;
        this.#graphics.x = body.x + width * offsetX;
        this.#graphics.y = body.y;
    }

    destroy() {
        this.#graphics.destroy();
    }

    /**
     *
     * @param fillPercentage must be a value between 0 and 1
     */
    updateFillPercentage(fillPercentage: number) {
        this.#prevFillPercentage = this.#fillPercentage;
        this.#fillPercentage = fillPercentage;
    }

    #addGraphics() {
        const { scene, width: gameObjectWidth } = this.#gameObject as Phaser.Physics.Arcade.Sprite;

        this.#width = gameObjectWidth * 0.75;
        this.#graphics = scene.add.graphics();
        this.#graphics.fillStyle(this.#fillStyle);
        this.#graphics.fillRect(0, 0, this.#width * this.#fillPercentage, this.height);
        this.#graphics.setDepth(depthLevels.high);
    }
}

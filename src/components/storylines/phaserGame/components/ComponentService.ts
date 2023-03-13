import { generateRandomId } from "../../../../utilities/Math.utils";

export type Constructor<T> = new (...args: unknown[]) => T;

export interface IComponent {
    init: (gameObject: Phaser.GameObjects.GameObject) => void;
    awake?: () => void;
    start?: () => void;
    update?: (time: number, delta: number) => void;
    destroy?: () => void;
}

export default class ComponentService {
    #componentsByGameObject: Map<string, IComponent[]> = new Map();
    #queuedForStart: IComponent[] = [];
    #queuedForDestroy: IComponent[] = [];

    addComponent(gameObject: Phaser.GameObjects.GameObject, component: IComponent) {
        if (!gameObject.name) {
            gameObject.name = generateRandomId();
        }

        if (!this.#componentsByGameObject.has(gameObject.name)) {
            this.#componentsByGameObject.set(gameObject.name, []);
        }

        const components = this.#componentsByGameObject.get(gameObject.name);
        components.push(component);

        component.init(gameObject);
        component.awake?.();

        if (component.start) {
            this.#queuedForStart.push(component);
        }
        if (component.destroy) {
            this.#queuedForDestroy.push(component);
        }
    }

    findComponent<ComponentType>(
        gameObject: Phaser.GameObjects.GameObject,
        componentType: Constructor<ComponentType>
    ) {
        const components = this.#componentsByGameObject.get(gameObject.name);
        if (!components) {
            return null;
        }

        return components.find(
            (component) => component instanceof componentType
        ) as unknown as ComponentType;
    }

    destroy() {
        while (this.#queuedForDestroy.length) {
            const component = this.#queuedForDestroy.shift();
            component.destroy();
        }
    }

    update(time: number, delta: number) {
        while (this.#queuedForStart.length) {
            const component = this.#queuedForStart.shift();
            component.start();
        }

        for (const [, components] of this.#componentsByGameObject.entries()) {
            for (const component of components) {
                if (component.update) {
                    component.update(time, delta);
                }
            }
        }
    }
}

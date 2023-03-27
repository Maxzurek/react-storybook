type State = (...args: unknown[]) => void;

export default class Brain {
    #activeState: State;
    #context: unknown;

    constructor(context: unknown) {
        this.#context = context;
    }

    setState(state: State) {
        this.#activeState = state;
    }

    update(time: number, delta: number) {
        this.#activeState?.call(this.#context, time, delta);
    }
}

import { Dispatch, ReactNode, createContext, useContext, useReducer } from "react";

//#region ContextState
export interface GameContextState {
    game: Phaser.Game;
}

const GameContextInitialState: GameContextState = {
    game: undefined,
};

export const GameContextState = createContext<GameContextState>(GameContextInitialState);
GameContextState.displayName = "GameContextState";
//#endregion

//#region ContextDispatch
export type GameContextDispatch = Dispatch<GameContextAction> | undefined;

export const GameDispatchContext = createContext<GameContextDispatch>(undefined);
GameDispatchContext.displayName = "GameDispatchContext";
//#endregion

//#region Reducer
export type GameContextAction = {
    type: "setGame";
    payload: Phaser.Game;
};

const GameReducer = (state: GameContextState, action: GameContextAction) => {
    switch (action.type) {
        case "setGame": {
            const game = action.payload;
            return { ...state, game };
        }
    }
};
//#endregion

interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
    const [state, dispatch] = useReducer(GameReducer, GameContextInitialState);

    return (
        <GameContextState.Provider value={state}>
            <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
        </GameContextState.Provider>
    );
};

export const useGameState = () => {
    const GameStateContext = useContext(GameContextState);

    if (!GameStateContext) {
        throw Error("useGameState must be used within a <GameProvider />");
    }

    return GameStateContext;
};

export const useGameDispatch = () => {
    const GameContextDispatch = useContext(GameDispatchContext);

    if (!GameDispatchContext) {
        throw Error("useGameDispatch must be used within a <GameProvider />");
    }

    return GameContextDispatch;
};

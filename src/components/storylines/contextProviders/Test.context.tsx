import {
    createContext,
    Dispatch,
    ReactNode,
    useContext,
    useReducer,
} from "react";

//#region ContextState
export interface TestContextState {
    // State properties
    property1: undefined;
}

const TestContextInitialState: TestContextState = {
    // Initial state
    property1: undefined,
};

export const TestContextState = createContext<TestContextState>(
    TestContextInitialState
);
TestContextState.displayName = "TestContextState";
//#endregion

//#region ContextDispatch
export type TestContextDispatch = Dispatch<TestContextAction> | undefined;

export const TestDispatchContext =
    createContext<TestContextDispatch>(undefined);
TestDispatchContext.displayName = "TestDispatchContext";
//#endregion

//#region Reducer
export type TestContextAction = {
    type: "doSomething";
    payload: undefined;
};

const TestReducer = (state: TestContextState, action: TestContextAction) => {
    switch (action.type) {
        case "doSomething":
            return { ...state };
        default:
            throw Error(`Unhandled action type: ${(action as any).type}`);
    }
};
//#endregion

interface TestProviderProps {
    children: ReactNode;
}

export const TestProvider = ({ children }: TestProviderProps) => {
    const [state, dispatch] = useReducer(TestReducer, TestContextInitialState);

    return (
        <TestContextState.Provider value={state}>
            <TestDispatchContext.Provider value={dispatch}>
                {children}
            </TestDispatchContext.Provider>
        </TestContextState.Provider>
    );
};

export const useTestState = () => {
    const TestStateContext = useContext(TestContextState);

    if (!TestStateContext) {
        throw Error("useTestState must be used within a <TestProvider />");
    }

    return TestStateContext;
};

export const useTestDispatch = () => {
    const TestContextDispatch = useContext(TestDispatchContext);

    if (!TestDispatchContext) {
        throw Error("useTestDispatch must be used within a <TestProvider />");
    }

    return TestContextDispatch;
};

export const useTest = () => {
    return [useTestState(), useTestDispatch()];
};

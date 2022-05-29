import {
    createContext,
    Dispatch,
    ReactElement,
    ReactNode,
    useContext,
    useReducer,
} from "react";
import Storyline1 from "../storylines/Storyline1";
import Storyline2 from "../storylines/Storyline2";
import Storyline3 from "../storylines/Storyline3";
import Storyline4 from "../storylines/Storyline4";
import Storyline5 from "../storylines/Storyline5";
import Storyline6 from "../storylines/Storyline6";

export interface Storyline {
    element: ReactElement;
    storyName: string;
}

export type StorylineContextAction =
    | {
          type: "setStories";
          payload: Storyline[];
      }
    | {
          type: "filterStoriesByKeyword";
          payload: string;
      };

export interface StorylineStateContext {
    storylines: Storyline[];
}

export type StorylineDispatchContext =
    | Dispatch<StorylineContextAction>
    | undefined;

const storylineReducer = (
    state: StorylineStateContext,
    action: StorylineContextAction
): StorylineStateContext => {
    switch (action.type) {
        case "setStories":
            return { ...state, storylines: action.payload };
        case "filterStoriesByKeyword": {
            const filteredStorylines =
                action.payload.length === 0
                    ? storylineContextInitialState.storylines
                    : storylineContextInitialState.storylines.filter(
                          ({ storyName }) => {
                              return storyName
                                  .toLowerCase()
                                  .includes(action.payload.toLowerCase());
                          }
                      );
            return {
                ...state,
                storylines: filteredStorylines,
            };
        }
        default:
            throw Error(`Unhandled action type: ${(action as any).type}`);
    }
};

export const storylineContextInitialState: StorylineStateContext = {
    storylines: [
        { element: <Storyline1 />, storyName: "Story 1" },
        { element: <Storyline2 />, storyName: "Story 2" },
        { element: <Storyline3 />, storyName: "Story 3" },
        { element: <Storyline4 />, storyName: "Story 4" },
        { element: <Storyline5 />, storyName: "Story 5" },
        { element: <Storyline6 />, storyName: "Story 6" },
    ],
};

export const StorylineStateContext = createContext<StorylineStateContext>(
    storylineContextInitialState
);

export const StorylineDispatchContext =
    createContext<StorylineDispatchContext>(undefined);

interface StorylineProviderProps {
    children: ReactNode;
}

export const StorylineProvider = ({ children }: StorylineProviderProps) => {
    const [state, dispatch] = useReducer(
        storylineReducer,
        storylineContextInitialState
    );

    return (
        <StorylineStateContext.Provider value={state}>
            <StorylineDispatchContext.Provider value={dispatch}>
                {children}
            </StorylineDispatchContext.Provider>
        </StorylineStateContext.Provider>
    );
};

export const useStorylineState = () => {
    const storylineStateContext = useContext(StorylineStateContext);

    if (!storylineStateContext) {
        throw Error(
            "useStorylineState must be used within a <StorylineProvider />"
        );
    }

    return storylineStateContext;
};

export const useStorylineDispatch = () => {
    const storylineDispatchContext = useContext(StorylineDispatchContext);

    if (!storylineDispatchContext) {
        throw Error("useStorylineDispatch must be used within a <StorylineProvider />");
    }

    return storylineDispatchContext;
};

export const useStoryline = () => {
    return [useStorylineState(), useStorylineDispatch()];
};

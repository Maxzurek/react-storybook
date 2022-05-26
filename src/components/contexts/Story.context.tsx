import {
    createContext,
    Dispatch,
    ReactElement,
    ReactNode,
    useContext,
    useReducer,
} from "react";
import Story from "../stories/Story";
import Storyline1 from "../storylines/Storyline1";
import Storyline2 from "../storylines/Storyline2";
import Storyline3 from "../storylines/Storyline3";
import Storyline4 from "../storylines/Storyline4";
import Storyline5 from "../storylines/Storyline5";
import Storyline6 from "../storylines/Storyline6";

export type StoryContextAction =
    | {
          type: "setStories";
          payload: ReactElement[];
      }
    | {
          type: "filterStoriesByKeyword";
          payload: string;
      };

export interface StoryStateContext {
    stories: ReactElement[];
    visibleStoryNames: string[];
}

export type StoryDispatchContext = Dispatch<StoryContextAction> | undefined;

const storyReducer = (
    state: StoryStateContext,
    action: StoryContextAction
): StoryStateContext => {
    switch (action.type) {
        case "setStories":
            return { ...state, stories: action.payload };
        case "filterStoriesByKeyword": {
            let visibleStoryNames: string[] = [];
            const filteredStories =
                action.payload.length === 0
                    ? storyContextInitialState.stories
                    : storyContextInitialState.stories.filter((story) => {
                          const isMatch = story.props.storyName
                              .toLowerCase()
                              .includes(action.payload.toLowerCase());

                          if (isMatch && story.props.storyName) {
                              visibleStoryNames = [
                                  ...visibleStoryNames,
                                  story.props.storyName
                              ];
                          }

                          return isMatch;
                      });
            return {
                ...state,
                stories: filteredStories,
                visibleStoryNames: visibleStoryNames,
            };
        }
        default:
            throw Error(`Unhandled action type: ${(action as any).type}`);
    }
};

export const storyContextInitialState: StoryStateContext = {
    stories: [
        <Story key="story1" storyName="Story 1">
            <Storyline1 />
        </Story>,
        <Story key="story2" storyName="Story 2">
            <Storyline2 />
        </Story>,
        <Story key="story3" storyName="Story 3">
            <Storyline3 />
        </Story>,
        <Story key="story4" storyName="Story 4">
            <Storyline4 />
        </Story>,
        <Story key="story5" storyName="Story 5">
            <Storyline5 />
        </Story>,
        <Story key="story6" storyName="Story 6">
            <Storyline6 />
        </Story>,
    ],
    visibleStoryNames: [],
};

export const StoryStateContext = createContext<StoryStateContext>(
    storyContextInitialState
);

export const StoryDispatchContext =
    createContext<StoryDispatchContext>(undefined);

interface StoryProviderProps {
    children: ReactNode;
}

export const StoryProvider = ({ children }: StoryProviderProps) => {
    const [state, dispatch] = useReducer(
        storyReducer,
        storyContextInitialState
    );

    return (
        <StoryStateContext.Provider value={state}>
            <StoryDispatchContext.Provider value={dispatch}>
                {children}
            </StoryDispatchContext.Provider>
        </StoryStateContext.Provider>
    );
};

export const useStoryState = () => {
    const storyStateContext = useContext(StoryStateContext);

    if (!storyStateContext) {
        throw Error("useStoryState must be used within a <StoryProvider />");
    }

    return storyStateContext;
};

export const useStoryDispatch = () => {
    const storyDispatchContext = useContext(StoryDispatchContext);

    if (!storyDispatchContext) {
        throw Error("useStoryDispatch must be used within a <StoryProvider />");
    }

    return storyDispatchContext;
};

export const useStory = () => {
    return [useStoryState(), useStoryDispatch()];
};

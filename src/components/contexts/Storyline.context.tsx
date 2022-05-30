import {
    createContext,
    Dispatch,
    ReactElement,
    ReactNode,
    useContext,
    useReducer,
} from "react";
import CountFormTypeIcon from "../storylines/countFormTypeIcon/CountFormTypeIcon";
import CssGrid from "../storylines/cssGrid/CssGrid";
import EditableAndCssFlex from "../storylines/editableAndCssFlex/EditableAndCssFlex";
import EditableAndMuiGrid from "../storylines/editableAndMuiGrid/EditableAndMuiGrid";
import MuiGridAndRotatableCard from "../storylines/muiGridAndRotatableCard/MuiGridAndRotatableCard";
import YoutubeCssCourseForm from "../storylines/youtubeCssCourseForm/YoutubeCssCourseForm";

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
        { element: <CountFormTypeIcon />, storyName: "Count form type icon - Story 1" },
        { element: <EditableAndCssFlex />, storyName: "Editable and CSS flex - Story 2" },
        { element: <EditableAndMuiGrid />, storyName: "Editable and MUI grid - Story 3" },
        { element: <CssGrid />, storyName: "Css grid - Story 4" },
        {
            element: <YoutubeCssCourseForm />,
            storyName: "Youtube Css course - Form - Story 5",
        },
        {
            element: <MuiGridAndRotatableCard />,
            storyName: "Mui grid and Rotatable card - Story 6",
        },
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
        throw Error(
            "useStorylineDispatch must be used within a <StorylineProvider />"
        );
    }

    return storylineDispatchContext;
};

export const useStoryline = () => {
    return [useStorylineState(), useStorylineDispatch()];
};

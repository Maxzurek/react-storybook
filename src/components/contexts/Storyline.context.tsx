import {
    createContext,
    Dispatch,
    ReactNode,
    useContext,
    useReducer,
} from "react";
import { Storyline } from "../../interfaces/Storyline.interfaces";
import CssGrid from "../storylines/cssGrid/CssGrid";
import EditableAndCssFlex from "../storylines/editableAndCssFlex/EditableAndCssFlex";
import EditableAndMuiGrid from "../storylines/editableAndMuiGrid/EditableAndMuiGrid";
import MuiCustomAutocomplete from "../storylines/muiCustomAutocomplete/MuiCustomAutocomplete";
import MuiGridAndRotatableCard from "../storylines/muiGridAndRotatableCard/MuiGridAndRotatableCard";
import MuiMenu from "../storylines/muiMenu/MuiMenu";
import SvgTransformation from "../storylines/svgTransformation/SvgTransformation";
import YoutubeCssCourseForm from "../storylines/youtubeCssCourseForm/YoutubeCssCourseForm";

//#region ContextAction
export type StorylineContextAction =
    | {
          type: "setStories";
          payload: Storyline[];
      }
    | {
          type: "filterStoriesByKeyword";
          payload: string;
      };
//#endregion

export interface StorylineStateContext {
    storylines: Storyline[];
}
export type StorylineDispatchContext =
    | Dispatch<StorylineContextAction>
    | undefined;

const storylineReducer = (
    state: StorylineStateContext,
    action: StorylineContextAction
) => {
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
        {
            element: <EditableAndCssFlex />,
            storyName: "Editable and CSS flex",
        },
        {
            element: <EditableAndMuiGrid />,
            storyName: "Editable and MUI grid",
        },
        { element: <CssGrid />, storyName: "Css grid" },
        {
            element: <YoutubeCssCourseForm />,
            storyName: "Youtube Css course - Form",
        },
        {
            element: <MuiGridAndRotatableCard />,
            storyName: "Mui grid and Rotatable card",
        },
        {
            element: <MuiCustomAutocomplete />,
            storyName: "Mui custom Autocomplete and PerfectScrollbar",
        },
        {
            element: <SvgTransformation />,
            storyName: "SVG transformation",
        },
        {
            element: <MuiMenu />,
            storyName: "Mui menu with nested menu item",
        },
    ],
};

export const StorylineStateContext = createContext<StorylineStateContext>(
    storylineContextInitialState
);
StorylineStateContext.displayName = "StoryLineStateContext";

export const StorylineDispatchContext =
    createContext<StorylineDispatchContext>(undefined);
StorylineDispatchContext.displayName = "StorylineDispatchContext";

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

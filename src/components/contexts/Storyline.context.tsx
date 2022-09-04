import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { Storyline } from "../../interfaces/Storyline.interfaces";
import CssGrid from "../storylines/cssGrid/CssGrid";
import EditableAndCssFlex from "../storylines/editableAndCssFlex/EditableAndCssFlex";
import EditableAndMuiGrid from "../storylines/editableAndMuiGrid/EditableAndMuiGrid";
import MuiCustomAutocomplete from "../storylines/muiCustomAutocomplete/MuiCustomAutocomplete";
import MuiGridAndRotatableCard from "../storylines/muiGridAndRotatableCard/MuiGridAndRotatableCard";
import MuiMenu from "../storylines/muiMenu/MuiMenu";
import SvgTransformation from "../storylines/svgTransformation/SvgTransformation";
import YoutubeCssCourseForm from "../storylines/youtubeCssCourseForm/YoutubeCssCourseForm";
import { generateRandomId } from "../../utilities/Math.utils";
import FolderTreeIndex from "../storylines/folderTree/FolderTreeIndex";

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
export type StorylineDispatchContext = Dispatch<StorylineContextAction> | undefined;

const storylineReducer = (state: StorylineStateContext, action: StorylineContextAction) => {
    switch (action.type) {
        case "setStories":
            return { ...state, storylines: action.payload };
        case "filterStoriesByKeyword": {
            const filteredStorylines =
                action.payload.length === 0
                    ? storylineContextInitialState.storylines
                    : storylineContextInitialState.storylines.filter(({ storyName }) => {
                          return storyName.toLowerCase().includes(action.payload.toLowerCase());
                      });
            return {
                ...state,
                storylines: filteredStorylines,
            };
        }
        default:
            throw Error(`Unhandled action type: ${(action as StorylineContextAction).type}`);
    }
};

export const storylineContextInitialState: StorylineStateContext = {
    storylines: [
        {
            id: generateRandomId(),
            element: <FolderTreeIndex />,
            storyName: "Folder tree",
        },
        {
            id: generateRandomId(),
            element: <MuiMenu />,
            storyName: "Mui menu with nested menu item",
        },
        {
            id: generateRandomId(),
            element: <SvgTransformation />,
            storyName: "SVG transformation",
        },
        {
            id: generateRandomId(),
            element: <MuiCustomAutocomplete />,
            storyName: "Mui custom Autocomplete and PerfectScrollbar",
        },
        {
            id: generateRandomId(),
            element: <MuiGridAndRotatableCard />,
            storyName: "Mui grid and Rotatable card",
        },
        {
            id: generateRandomId(),
            element: <YoutubeCssCourseForm />,
            storyName: "Youtube Css course - Form",
        },
        { id: generateRandomId(), element: <CssGrid />, storyName: "Css grid" },
        {
            id: generateRandomId(),
            element: <EditableAndMuiGrid />,
            storyName: "Editable and MUI grid",
        },
        {
            id: generateRandomId(),
            element: <EditableAndCssFlex />,
            storyName: "Editable and CSS flex",
        },
    ],
};

export const StorylineStateContext = createContext<StorylineStateContext>(
    storylineContextInitialState
);
StorylineStateContext.displayName = "StoryLineStateContext";

export const StorylineDispatchContext = createContext<StorylineDispatchContext>(undefined);
StorylineDispatchContext.displayName = "StorylineDispatchContext";

interface StorylineProviderProps {
    children: ReactNode;
}

export const StorylineProvider = ({ children }: StorylineProviderProps) => {
    const [state, dispatch] = useReducer(storylineReducer, storylineContextInitialState);

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
        throw Error("useStorylineState must be used within a <StorylineProvider />");
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

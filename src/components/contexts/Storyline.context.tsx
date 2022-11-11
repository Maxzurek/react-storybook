import { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { Storyline } from "../../interfaces/Storyline.interfaces";
import EditableAndCssFlex from "../storylines/editableAndCssFlex/EditableAndCssFlex";
import MuiGridAndRotatableCard from "../storylines/muiGridAndRotatableCard/MuiGridAndRotatableCard";
import SvgTransformation from "../storylines/svgTransformation/SvgTransformation";
import { generateRandomId } from "../../utilities/Math.utils";
import FolderTreeIndex from "../storylines/folderTree/FolderTreeIndex";
import MuiMenuIndex from "../storylines/muiMenu/MuiMenuIndex";
import ExpandableDivIndex from "../storylines/expandableDiv/ExpandableDivIndex";
import CarouselIndex from "../storylines/carousel/CarouselIndex";
import useLocalStorageState from "../../hooks/useLocalStorage";
import HexColorGuessingGame from "../storylines/hexColorGuessingGame/HexColorGuessingGame";

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
                    : filterStoryByKeyword(action.payload);
            return {
                ...state,
                storylines: filteredStorylines,
            };
        }
        default:
            throw Error(`Unhandled action type: ${(action as StorylineContextAction).type}`);
    }
};

const filterStoryByKeyword = (keyword: string) => {
    const filteredStorylines = storylineContextInitialState.storylines.filter(({ storyName }) => {
        return storyName.toLowerCase().includes(keyword.toLowerCase());
    });

    return filteredStorylines;
};

export const storylineContextInitialState: StorylineStateContext = {
    storylines: [
        {
            id: generateRandomId(),
            element: <CarouselIndex />,
            storyName: "Carousel",
        },
        {
            id: generateRandomId(),
            element: <ExpandableDivIndex />,
            storyName: "Expandable div",
        },
        {
            id: generateRandomId(),
            element: <FolderTreeIndex />,
            storyName: "Folder tree",
        },
        {
            id: generateRandomId(),
            element: <MuiMenuIndex />,
            storyName: "Mui menu with nested menu item",
        },
        {
            id: generateRandomId(),
            element: <SvgTransformation />,
            storyName: "SVG transformation",
        },
        {
            id: generateRandomId(),
            element: <HexColorGuessingGame />,
            storyName: "Hex color guessing game",
        },
        {
            id: generateRandomId(),
            element: <MuiGridAndRotatableCard />,
            storyName: "Mui grid and Rotatable card",
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
    const [filterKeyword] = useLocalStorageState("filterKeyWord");
    const initialFilteredStorylines = filterStoryByKeyword(filterKeyword);
    const storylineContextInitialState = { storylines: initialFilteredStorylines };
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

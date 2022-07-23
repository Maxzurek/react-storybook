import { ReactElement } from "react";
import { StoryRef } from "./Story.interfaces";

export interface Storyline {
    element: ReactElement;
    storyName: string;
    storyRef?: StoryRef;
}

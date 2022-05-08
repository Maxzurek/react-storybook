import "./Story.scss"

import React, { ReactNode, useState } from "react";

interface StoryProps {
    children: ReactNode;
    storyName?: string;
}

export default function Story(props: StoryProps) {

    const [hideStory, setHideStory] = useState(true);

    const handleButtonHideCLicked = () => {
        setHideStory(!hideStory)
    }

    return (
        <div className={"story"}>
            <div className="story__toolbar">
                <button className="story__button story__button--hide-story" onClick={() => handleButtonHideCLicked()} />
            </div>
            <div className="story__header">
                <h2>{props.storyName || "Undefined Story"}</h2>
            </div>
            <div className={`story__body${hideStory ? '--hidden' : ""}`}>
                {props.children}
            </div>
        </div>
    )
};

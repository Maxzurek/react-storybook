import "./Story.scss";

import { Key, ReactNode, useEffect, useState } from "react";
import { useStoryState } from "../contexts/Story.context";

interface StoryProps {
    children: ReactNode;
    storyName?: string;
}

export default function Story({ children, storyName }: StoryProps) {
    const [hideStory, setHideStory] = useState(true);
    const { visibleStoryNames } = useStoryState();

    useEffect(() => {
        visibleStoryNames.findIndex((id) => id === storyName) > -1
            ? setHideStory(false)
            : setHideStory(true);
    }, [visibleStoryNames]);

    const handleButtonHideCLicked = () => {
        setHideStory(!hideStory);
    };

    return (
        <div className={"story"}>
            <div className="story__toolbar">
                <button
                    className="story__button story__button--hide-story"
                    onClick={() => handleButtonHideCLicked()}
                />
            </div>
            <div className="story__header">
                <h2>{storyName || "Undefined Story"}</h2>
            </div>
            <div className={`story__body${hideStory && "--hidden"}`}>
                {children}
            </div>
        </div>
    );
}

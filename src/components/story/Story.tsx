import "./Story.scss";

import { ReactNode, useState } from "react";

interface StoryProps {
    children: ReactNode;
    storyName?: string;
}

export default function Story({ children, storyName }: StoryProps) {
    const [hideStory, setHideStory] = useState(false);

    const handleButtonHideCLicked = () => {
        setHideStory(!hideStory);
    };

    return (
        <section className={"story"} id={`${storyName}`}>
            <div className="story__toolbar">
                <button
                    className="story__button story__button--hide-story"
                    onClick={() => handleButtonHideCLicked()}
                />
            </div>
            <div className="story__header">
                <h1>{storyName || "Undefined Story name"}</h1>
            </div>
            <div className={`story__body${hideStory ? "--hidden": ""}`}>
                {children}
            </div>
        </section>
    );
}

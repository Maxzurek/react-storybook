import "./Story.scss";

import {
    forwardRef,
    ReactNode,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { StoryRef } from "../../interfaces/Story.interfaces";

interface StoryProps {
    children: ReactNode;
    storyName: string;
}

const Story = forwardRef<StoryRef, StoryProps>(
    ({ children, storyName }: StoryProps, ref) => {
        const [hideStory, setHideStory] = useState(false);

        const divElementRef = useRef<HTMLDivElement | null>(null);

        const scrollTop = () => {
            divElementRef.current?.scrollIntoView();
        };

        const handleButtonHideCLicked = () => {
            setHideStory(!hideStory);
        };

        useImperativeHandle(ref, () => ({
            storyDivElement: divElementRef.current,
            scrollTop,
        }));

        return (
            <div ref={divElementRef} className={"story"} id={`${storyName}`}>
                <div className="story__toolbar">
                    <button
                        className="story__button story__button--hide-story"
                        onClick={() => handleButtonHideCLicked()}
                    />
                </div>
                <div className="story__header">
                    <h1>{storyName || "Undefined Story name"}</h1>
                </div>
                <div className={`story__body${hideStory ? "--hidden" : ""}`}>
                    {children}
                </div>
            </div>
        );
    }
);

Story.displayName = "Story";

export default Story;

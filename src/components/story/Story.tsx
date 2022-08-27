import "./Story.scss";

import {
    forwardRef,
    ReactNode,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import useScrollUntilVisible from "../../hooks/useScrollUntilVisible";

export interface StoryRef {
    storyDivElement: HTMLDivElement | null;
    scrollIntoView: () => void;
}

interface StoryProps {
    children: ReactNode;
    storyName: string;
}

const Story = forwardRef<StoryRef, StoryProps>(
    ({ children, storyName }: StoryProps, ref) => {
        const { scrollElementIntoView: scrollStoryIntoView } =
            useScrollUntilVisible();

        const [hideStory, setHideStory] = useState(false);

        const divElementRef = useRef<HTMLDivElement | null>(null);

        const handleScrollIntoView = () => {
            scrollStoryIntoView(divElementRef.current, {
                scrollArgs: { behavior: "smooth" },
                intersectionRatio: 0.25,
            });
        };

        const handleButtonHideCLicked = () => {
            setHideStory(!hideStory);
        };

        useImperativeHandle(ref, () => ({
            storyDivElement: divElementRef.current,
            scrollIntoView: handleScrollIntoView,
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

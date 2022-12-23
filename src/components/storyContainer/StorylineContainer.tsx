import React from "react";
import { useStorylineState } from "../contexts/Storyline.context";
import Story, { StoryRef } from "../story/Story";

interface StorylineContainerProps {
    onSetStoryRefMap: (id: string, node: StoryRef) => void;
}

export default function StorylineContainer({ onSetStoryRefMap }: StorylineContainerProps) {
    const { storylines } = useStorylineState();

    return (
        <>
            {storylines.map(({ storyName, element, id }) => (
                <React.Fragment key={id}>
                    <Story
                        key={id}
                        ref={(node) => onSetStoryRefMap(id, node)}
                        storyName={storyName}
                    >
                        {element}
                    </Story>
                </React.Fragment>
            ))}
        </>
    );
}

import { useStoryState } from "../contexts/Story.context";

export default function Stories() {
    const storyState = useStoryState();

    return (
        <>
            {storyState.stories.map((story) => {
                return story;
            })}
        </>
    );
}

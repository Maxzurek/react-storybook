import { useStoryState } from "../contexts/Story.context";

export default function Stories() {
    const {stories} = useStoryState();

    return (
        <>
            {stories.map((story) => {
                return story;
            })}
        </>
    );
}

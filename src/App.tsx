import Story from "./components/stories/Story";
import Storyline1 from "./components/storylines/Storyline1";
import Storyline2 from "./components/storylines/Storyline2";
import Storyline3 from "./components/storylines/Storyline3";

const App = () => {
    return (
        <>
            <Story storyName="Story 1">
                <Storyline1 />
            </Story>
            <Story storyName="Story 2">
                <Storyline2 />
            </Story>
            <Story storyName="Story 3">
                <Storyline3 />
            </Story>
        </>
    );
};

export default App;

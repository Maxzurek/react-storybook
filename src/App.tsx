import "./App.scss";
import { useStorylineState } from "./components/contexts/Storyline.context";
import Sidebar from "./components/sidebar/Sidebar";
import Story from "./components/story/Story";

const App = () => {
    const { storylines } = useStorylineState();
    return (
        <div className="app">
            <div className="app__body">
                <div className="app__stories">
                    {storylines.map((story) => {
                        return (
                            <Story
                                key={story.storyName}
                                storyName={story.storyName}
                            >
                                {story.element}
                            </Story>
                        );
                    })}
                </div>
                <Sidebar />
            </div>
        </div>
    );
};

export default App;

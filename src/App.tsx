import { useRef } from "react";
import "./App.scss";
import { useStorylineState } from "./components/contexts/Storyline.context";
import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import Story from "./components/story/Story";
import useScroll from "./hooks/useScroll";

const App = () => {
    const { storylines } = useStorylineState();

    const storiesDivRef = useRef<HTMLDivElement>(null);
    const { scrollPosition, scrollHeight } = useScroll(storiesDivRef);

    return (
        <div className="app">
            <div className="app__body">
                <div className="app__header">
                    <Header scrollPosition={scrollPosition} />
                </div>
                <div ref={storiesDivRef} className="app__stories">
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
            </div>
            <Sidebar
                scrollHeight={scrollHeight}
                scrollPosition={scrollPosition}
            />
        </div>
    );
};

export default App;

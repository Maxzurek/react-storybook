import { useRef } from "react";
import "./App.scss";
import { useStorylineState } from "./components/contexts/Storyline.context";
import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import Story from "./components/story/Story";

const App = () => {
    const { storylines } = useStorylineState();

    const storiesDivRef = useRef<HTMLDivElement>(null);

    return (
        <div className="app">
            <div className="app__body">
                <div className="app__header">
                    <Header storiesDivRef={storiesDivRef} />
                </div>
                <div ref={storiesDivRef} className="app__stories">
                    {storylines.map((story) => {
                        return (
                            <Story
                                key={story.storyName}
                                ref={(node) => {
                                    if (node) {
                                        story.storyRef = node;
                                    }
                                }}
                                storyName={story.storyName}
                            >
                                {story.element}
                            </Story>
                        );
                    })}
                </div>
            </div>
            <Sidebar storiesDivRef={storiesDivRef} />
        </div>
    );
};

export default App;

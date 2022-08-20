import React, { useRef } from "react";
import "./App.scss";
import { useStorylineState } from "./components/contexts/Storyline.context";
import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import Story, { StoryRef } from "./components/story/Story";
import useRefMap from "./hooks/useRefMap";

const App = () => {
    const { storylines } = useStorylineState();
    const { getRefMap: getStoryRefMap, setRefCallback: setStoryRefCallback } =
        useRefMap<StoryRef>();

    const storyContainerDivRef = useRef<HTMLDivElement>(null);

    return (
        <div className="app">
            <div className="app__body">
                <div className="app__header">
                    <Header storiesDivRef={storyContainerDivRef} />
                </div>
                <div
                    ref={storyContainerDivRef}
                    className="app__story-container"
                >
                    {storylines.map(({ storyName, element, id }) => {
                        return (
                            <React.Fragment key={id}>
                                <Story
                                    key={id}
                                    ref={(node) =>
                                        setStoryRefCallback(id, node)
                                    }
                                    storyName={storyName}
                                >
                                    {element}
                                </Story>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            <Sidebar
                storyContainerDivRef={storyContainerDivRef}
                storyRefMap={getStoryRefMap()}
            />
        </div>
    );
};

export default App;

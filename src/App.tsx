import React, { useRef } from "react";
import "./App.scss";
import { useStorylineState } from "./components/contexts/Storyline.context";
import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import Story, { StoryRef } from "./components/story/Story";
import useRefMap from "./hooks/useRefMap";

export const appStoryContainerPadding = 20;

const App = () => {
    const { storylines } = useStorylineState();
    const { getRefMap: getStoryRefMap, setRefMap: setStoryRefMap } = useRefMap<StoryRef>();

    const storyContainerDivRef = useRef<HTMLDivElement>(null);

    return (
        <div className="app">
            <Sidebar storyContainerDivRef={storyContainerDivRef} storyRefMap={getStoryRefMap()} />
            <div className="app__body">
                <div className="app__header">
                    <Header storiesDivRef={storyContainerDivRef} />
                </div>
                <div
                    ref={storyContainerDivRef}
                    className="app__story-container"
                    style={
                        {
                            "--app-story-container-padding": `${appStoryContainerPadding}px`,
                        } as React.CSSProperties
                    }
                >
                    {storylines.map(({ storyName, element, id }) => {
                        return (
                            <React.Fragment key={id}>
                                <Story
                                    key={id}
                                    ref={(node) => setStoryRefMap(id, node)}
                                    storyName={storyName}
                                >
                                    {element}
                                </Story>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default App;

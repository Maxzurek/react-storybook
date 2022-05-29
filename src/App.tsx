import "./App.scss";
import { StoryProvider } from "./components/contexts/Story.context";
import Sidebar from "./components/sidebar/Sidebar";
import Stories from "./components/stories/Stories";

const App = () => {
    return (
        <StoryProvider>
            <div className="app">
                <div className="app__body">
                    <div className="app__stories">
                        <Stories />
                    </div>
                    <Sidebar />
                </div>
            </div>
        </StoryProvider>
    );
};

export default App;

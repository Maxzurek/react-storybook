import "./App.scss";
import { StoryProvider } from "./components/contexts/Story.context";
import Header from "./components/header/Header";
import Stories from "./components/stories/Stories";

const App = () => {
    return (
        <StoryProvider>
            <div className="app">
                <Header />
                <Stories />
            </div>
        </StoryProvider>
    );
};

export default App;

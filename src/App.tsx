import Story from './components/stories/Story';
import Storyline1 from './components/storylines/Storyline1';
import Storyline2 from './components/storylines/Storyline2';

interface AppProps {
}

const App = (props: AppProps) => {

  return (
    <>
      <Story storyName='Story 1'>
        <Storyline1 />
      </Story>
      <Story storyName='Story 2'>
        <Storyline2 />
      </Story>
    </>
  )
}

export default App;

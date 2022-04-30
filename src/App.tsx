import './App.css';
import { CountFormTypeIconsProvider } from './components/CountFormTypeIconProvider';
import WrapperContainer from './components/WrapperContainer';

interface AppProps {

}

const App = (props: AppProps) => {

  return (
    <CountFormTypeIconsProvider>
      <div style={{ width: '33.3%', float: 'left' }}>
        App
        <WrapperContainer />
      </div>
    </CountFormTypeIconsProvider>
  )
}

export default App;

import { Paper, TextField } from '@mui/material';
import { useRef, useState } from 'react';
import { CountFormTypeIconsProvider } from './components/CountFormTypeIconProvider/CountFormTypeIconProvider';
import WrapperContainer from './components/CountFormTypeIconProvider/WrapperContainer';
import Editable, { EditableInputType } from './components/utilities/Editable';

interface AppProps {

}

interface Todo {
  description: string;
}

const App = (props: AppProps) => {

  const [todos, setTodos] = useState<Todo[]>([
    {
      description: "Do something"
    },
    {
      description: "Do something else"
    },
    {
      description: "Do something else more"
    },
    {
      description: "Do something else even more"
    },
    {
      description: "Do something else even more"
    },
    {
      description: "Do something else even more"
    },
    {
      description: "Do something else even more"
    },
    {
      description: "Do something else even more"
    },
    {
      description: "Do something else even more"
    },
    {
      description: "Do something else even more"
    },
    {
      description: "Do something else even more"
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteTodo = (index: number) => {
    const todosCopy = [...todos];
    todosCopy.splice(index, 1);
    setTodos(todosCopy);
  }

  const handleTodoChanged = (value: string, index: number) => {
    const todosCopy = [...todos];
    todosCopy[index].description = value;
    setTodos(todosCopy);
  }

  return (
    <>
      <Paper elevation={6}>
        <CountFormTypeIconsProvider>
          <WrapperContainer />
        </CountFormTypeIconsProvider>
      </Paper>

      <Paper
        elevation={6}
        sx={{
          marginTop: 5
        }}
      >
        {todos.map((_, index: number) => {
          return (
            <Editable
              key={`editable-${index}`}
              text={todos[index].description}
              type={EditableInputType.Input}
              chilfRef={inputRef}
              placeholder="Placeholder"
              onDelete={() => handleDeleteTodo(index)}
            >
              <input
                type="text"
                ref={inputRef}
                value={todos[index].description}
                onChange={event => handleTodoChanged(event.target.value, index)}
              />
              {/* <TextField
                size="small"
                value={todos[index].description}
                onChange={event => handleTodoChanged(event.target.value, index)}
                inputRef={inputRef}
              /> */}
            </Editable>
          )
        })}
      </Paper>
    </>
  )
}

export default App;

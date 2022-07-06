import "./EditableAndMuiGrid.scss";

import { Box, Grid } from "@mui/material";
import { useState, useRef } from "react";
import Editable, { EditableInputType } from "../../editable/Editable";

interface Todo {
    description: string;
}

export default function EditableAndMuiGrid() {
    const [todos, setTodos] = useState<Todo[]>([
        {
            description: "Do something",
        },
        {
            description: "Do something else",
        },
        {
            description: "Do something else more",
        },
        {
            description: "Do something else even more",
        },
        {
            description: "Do something else even more",
        },
        {
            description: "Do something else even more",
        },
        {
            description: "Do something else even more",
        },
        {
            description: "Do something else even more",
        },
        {
            description: "Do something else even more",
        },
        {
            description: "Do something else even more",
        },
        {
            description: "Do something else even more",
        },
    ]);
    const [newTodo, setNewTodo] = useState("");
    const inputRef = useRef<any>(null);

    const maxInputLength = 300;

    const handleAddTodo = () => {
        setTodos((prevTodos) => [...prevTodos, { description: newTodo }]);
        setNewTodo("");
    };

    const handleDeleteTodo = (index: number) => {
        const todosCopy = [...todos];
        todosCopy.splice(index, 1);
        setTodos(todosCopy);
    };

    const handleTodoChanged = (value: string, index: number) => {
        const todosCopy = [...todos];
        todosCopy[index].description = value;
        setTodos(todosCopy);
    };

    return (
        <Grid container mb={2}>
            <Grid className="editable-and-mui-grid__column" item p={1} xs={4}>
                <Box display="flex" gap={1} ml={1}>
                    <input
                        className="story__input"
                        maxLength={maxInputLength}
                        placeholder="Enter a new TODO"
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                    />
                    <button
                        className="story__button editable-and-mui-grid__button-add-todo"
                        onClick={() => handleAddTodo()}
                    >
                        Add a Todo
                    </button>
                </Box>
            </Grid>
            <Grid id="editable-and-mui-grid__column" item p={1} xs={8}>
                {todos.map((_, index: number) => {
                    return (
                        <Box
                            key={`editable-${index}`}
                            display="inline-flex"
                            m={0.5}
                        >
                            <Editable
                                chilfRef={inputRef}
                                id={
                                    "editable-and-mui-grid__column__todos__editable"
                                }
                                placeholder="Placeholder"
                                text={todos[index].description}
                                type={EditableInputType.Input}
                                onDelete={() => handleDeleteTodo(index)}
                            >
                                <input
                                    ref={inputRef}
                                    maxLength={maxInputLength}
                                    type="text"
                                    value={todos[index].description}
                                    onChange={(event) =>
                                        handleTodoChanged(
                                            event.target.value,
                                            index
                                        )
                                    }
                                />
                            </Editable>
                        </Box>
                    );
                })}
            </Grid>
        </Grid>
    );
}

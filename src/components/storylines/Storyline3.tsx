import "./Storyline3.scss";

import { Box, Grid, Stack } from "@mui/material";
import { useState, useRef } from "react";
import Editable, { EditableInputType } from "../utilities/Editable";

interface Todo {
    description: string;
}

export default function Storyline3() {
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

    const maxInputLength = 30;

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
        <Grid
            alignItems="flex-start"
            container
            direction="row"
            justifyContent="space-around"
            mb={2}
        >
            <Grid id="storyline3__column" item p={1}>
                <input
                    className="story__input"
                    maxLength={maxInputLength}
                    placeholder="Enter a new TODO"
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                />
                <button
                    className="story__button"
                    onClick={() => handleAddTodo()}
                >
                    Add a Todo
                </button>
            </Grid>
            <Grid id="storyline3__column" item lg={8} p={1} sm={6}>
                {todos.map((_, index: number) => {
                    return (
                        <Box
                            key={`editable-${index}`}
                            m={0.5}
                            sx={{ display: "inline-block" }}
                        >
                            <Editable
                                chilfRef={inputRef}
                                id={"storyline3__column__todos__editable"}
                                placeholder="Placeholder"
                                text={todos[index].description}
                                type={EditableInputType.Input}
                                onDelete={() => handleDeleteTodo(index)}
                            >
                                {/* <textarea
                                        ref={inputRef}
                                        value={todos[index].description}
                                        onChange={event => handleTodoChanged(event.target.value, index)}
                                    /> */}
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
                                {/* <TextField
                                        size="small"
                                        value={todos[index].description}
                                        onChange={event => handleTodoChanged(event.target.value, index)}
                                        inputRef={inputRef}
                                    /> */}
                            </Editable>
                        </Box>
                    );
                })}
            </Grid>
        </Grid>
    );
}

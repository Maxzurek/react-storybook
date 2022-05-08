import "./Storyline2.scss"

import Editable, { EditableInputType } from "../utilities/Editable";
import React, { useState, useRef } from "react";

interface Todo {
    description: string;
}

// 
export default function Storyline2() {

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
    const [newTodo, setNewTodo] = useState("");

    const inputRef = useRef<any>(null);

    const handleAddTodo = () => {
        setTodos(prevTodos => [...prevTodos, { description: newTodo }])
        setNewTodo("");
    }

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
        <div className="storyline2">
            <div className="storyline2__container">
                <div className="storyline2__column">
                    <div className="storyline2__row">
                        <input
                            className="storyline2__input"
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
                    </div>
                </div>
                <div className="storyline2__column">
                    {todos.map((_, index: number) => {
                        return (
                            <div className="storyline2__editable" key={`editable-${index}`}>
                                <Editable
                                    text={todos[index].description}
                                    type={EditableInputType.Input}
                                    chilfRef={inputRef}
                                    placeholder="Placeholder"
                                    onDelete={() => handleDeleteTodo(index)}
                                >
                                    {/* <textarea
                                        ref={inputRef}
                                        value={todos[index].description}
                                        onChange={event => handleTodoChanged(event.target.value, index)}
                                    /> */}
                                    <input
                                        maxLength={20}
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
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
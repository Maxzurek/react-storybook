import "./Storyline2.scss";

import Editable, { EditableInputType } from "../utilities/Editable";
import { useState, useRef } from "react";

interface Todo {
    description: string;
}

export default function Storyline2() {
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
        <div className="storyline2">
            <div className="storyline2__container">
                <div className="storyline2__column">
                    <div className="storyline2__row">
                        <input
                            className="storyline2__input"
                            maxLength={maxInputLength}
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
                            <div
                                key={`editable-${index}`}
                                className="storyline2__editable"
                            >
                                <Editable
                                    chilfRef={inputRef}
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
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

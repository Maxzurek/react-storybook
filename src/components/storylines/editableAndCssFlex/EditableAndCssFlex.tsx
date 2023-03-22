import "./EditableAndCssFlex.scss";

import { useState, useRef } from "react";
import Editable, { EditableInputType } from "../../editable/Editable";

interface Todo {
    description: string;
}

export default function EditableAndCssFlex() {
    const [todos, setTodos] = useState<Todo[]>([
        {
            description: "Do something",
        },
        {
            description: "Do something else",
        },
        {
            description: "Don't forget to buy some eggs",
        },
        {
            description: "Call Kevin",
        },
    ]);
    const [newTodo, setNewTodo] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

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
        <div className="editable-and-css-flex">
            <div className="editable-and-css-flex__container">
                <div className="editable-and-css-flex__column">
                    <div className="editable-and-css-flex__row">
                        <input
                            className="editable-and-css-flex__input"
                            maxLength={maxInputLength}
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                        />
                        <button className="story__button" onClick={() => handleAddTodo()}>
                            Add a Todo
                        </button>
                    </div>
                </div>
                <div className="editable-and-css-flex__column">
                    {todos.map((_, index: number) => {
                        return (
                            <div
                                key={`editable-${index}`}
                                className="editable-and-css-flex__editable"
                            >
                                <Editable
                                    inputElement={inputRef.current}
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
                                            handleTodoChanged(event.target.value, index)
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

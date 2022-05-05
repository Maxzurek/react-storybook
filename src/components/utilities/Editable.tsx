import "./Editable.scss"

import { Chip } from "@mui/material";
import { ReactNode, RefObject, useEffect, useState } from "react";

export enum EditableInputType {
    Input = "input",
    TextArea = "textarea",
}

interface EditableProps {
    text: string;
    type: EditableInputType;
    children: ReactNode;
    chilfRef: RefObject<HTMLInputElement>;
    placeholder?: string;

    onDelete?: (event: React.EventHandler<any>) => void
}

export default function Editable(props: EditableProps) {

    const [isEditing, setEditing] = useState(false);

    const {
        text,
        type,
        children,
        chilfRef,
        placeholder,
        onDelete,
    } = props;

    useEffect(() => {
        if (isEditing) {
            chilfRef?.current?.focus();
        }
    }, [isEditing, chilfRef]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, type: string) => {
        const { key } = event;
        const keys = ["Escape", "Tab"];
        const enterKey = "Enter";
        const allKeys = [...keys, enterKey];
        if (
            (type === "textarea" && keys.indexOf(key) > -1) ||
            (type !== "textarea" && allKeys.indexOf(key) > -1)
        ) {
            setEditing(false);
        }
    };

    return (
        <div className="editable-root">
            {isEditing ? (
                <div className="editable-root__input-div"
                    onBlur={() => setEditing(false)}
                    onKeyDown={e => handleKeyDown(e, type)}
                >
                    {children}
                </div>
            ) : (
                <div
                    className="editable-root__label-div"
                    onClick={() => setEditing(true)}
                >
                    {onDelete
                        ? <Chip
                            label={text || placeholder || "Editable content"}
                            onDelete={onDelete}
                        />
                        : <span style={{ color: text ? 'black' : 'grey' }} id="label">
                            {text || placeholder || "Editable content"}
                        </span>
                    }
                </div>
            )}
        </div>
    );
};

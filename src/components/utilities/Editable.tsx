import './Editable.scss';

import { IconButton } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { Delete, Edit } from '@mui/icons-material';

export enum EditableInputType {
    Input = 'input',
    TextArea = 'textarea',
}

interface EditableProps {
    text: string;
    type: EditableInputType;
    children: ReactNode;
    chilfRef: any;
    placeholder?: string;

    onDelete?: () => React.EventHandler<any> | undefined | void;
}

export default function Editable(props: EditableProps) {

    const [isEditing, setEditing] = useState(false);
    const [displayActionButtons, setDisplayActionButtons] = useState(false);

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
        const keys = ['Escape', 'Tab'];
        const enterKey = 'Enter';
        const allKeys = [...keys, enterKey];
        if (
            (type === 'textarea' && keys.indexOf(key) > -1) ||
            (type !== 'textarea' && allKeys.indexOf(key) > -1)
        ) {
            setEditing(false);
        }
    };

    const handleOnBlur = () => {
        setEditing(false);
    }

    const handleOnLabelMouseOver = () => {
        setDisplayActionButtons(true);
    }

    const handleOnLabelMouseLeave = () => {
        setDisplayActionButtons(false);
    }

    const handleEdit = () => {
        setEditing(true);
    }

    return (
        <div className="editable">
            {isEditing ? (
                <div className="editable__input-div"
                    onBlur={() => handleOnBlur()}
                    onKeyDown={e => handleKeyDown(e, type)}
                >
                    {children}
                </div>
            ) : (
                <div
                    className="editable__label-div"
                    onMouseOver={() => handleOnLabelMouseOver()}
                    onMouseLeave={() => handleOnLabelMouseLeave()}
                >
                    <span
                        className="editable__label"
                    >
                        {text || placeholder}
                    </span>
                    <div className={`editable__action-buttons ${displayActionButtons ? 'visible' : ''}`}>
                        <IconButton aria-label="edit label" component="span" size="small" onClick={() => handleEdit()}>
                            <Edit fontSize="small" id="editable__action-buttons__edit" />
                        </IconButton>
                        <IconButton aria-label="delete label" component="span" size="small" onClick={onDelete} >
                            <Delete fontSize="small" id="editable__action-buttons__delete" />
                        </IconButton>
                    </div>
                </div>
            )}
        </div>
    );
};

import "./FilterBar.scss";

import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useRef } from "react";

interface FilterBarProps {
    filterKeyword: string;

    onChange: (value: string) => void;
    onReset: () => void;
}

export default function FilterBar({
    filterKeyword,
    onChange,
    onReset,
}: FilterBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="filter-bar">
            <input
                ref={inputRef}
                className="story__input filter-bar__input"
                placeholder="Filter stories by keyword"
                type="text"
                value={filterKeyword}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="separator separator--vertical" />
            <Tooltip title="Reset">
                <button
                    className="story__button filter-bar__button-search"
                    onClick={() => {
                        inputRef.current?.focus();
                        onReset();
                    }}
                >
                    <FontAwesomeIcon
                        className="filter-bar__button-search-icon"
                        icon={faRotateLeft}
                    />
                </button>
            </Tooltip>
        </div>
    );
}

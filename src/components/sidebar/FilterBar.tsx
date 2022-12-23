import "./FilterBar.scss";

import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { forwardRef, useRef } from "react";

interface FilterBarProps {
    filterKeyword: string;
    onChange: (value: string) => void;
    onReset: () => void;
}

const FilterBar = forwardRef<HTMLInputElement, FilterBarProps>(
    ({ filterKeyword, onChange, onReset }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null);

        const handleReset = () => {
            inputRef.current?.focus();
            onReset();
        };

        const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        };

        const handleForwardRef = (node: HTMLInputElement) => {
            if (ref) {
                if (typeof ref === "function") {
                    ref(node);
                } else {
                    ref.current = node;
                }
            }
        };

        const handleInputRefCallback = (node: HTMLInputElement) => {
            inputRef.current = node;
            handleForwardRef(node);
        };

        return (
            <div className="filter-bar">
                <input
                    ref={handleInputRefCallback}
                    className="story__input filter-bar__input"
                    placeholder="Filter by keyword"
                    type="text"
                    value={filterKeyword}
                    onChange={handleChangeInput}
                />
                <Tooltip arrow title="Reset filter">
                    <button
                        className="story__button filter-bar__button-reset"
                        onClick={handleReset}
                    >
                        <FontAwesomeIcon
                            className="filter-bar__button-search-reset"
                            icon={faRotateLeft}
                        />
                    </button>
                </Tooltip>
            </div>
        );
    }
);

FilterBar.displayName = "FilterBar";
export default FilterBar;

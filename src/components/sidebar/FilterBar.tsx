import "./FilterBar.scss";

import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useRef, useEffect } from "react";
import useLocalStorageState from "../../hooks/useLocalStorage";
import { useStorylineDispatch } from "../contexts/Storyline.context";

export default function FilterBar() {
    const [filterKeyword, setFilterKeyword] =
        useLocalStorageState("filterKeyWord");
    const storyDispatch = useStorylineDispatch();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        storyDispatch({
            type: "filterStoriesByKeyword",
            payload: filterKeyword,
        });
    }, [filterKeyword]);

    const handleFilterKeywordChamged = (value: string) => {
        setFilterKeyword(value);
    };

    const handleResetKeyword = () => {
        setFilterKeyword("");
        inputRef.current?.focus();
    };

    return (
        <div className="filter-bar">
            <input
                ref={inputRef}
                className="story__input filter-bar__input"
                placeholder="Filter stories by keyword"
                type="text"
                value={filterKeyword}
                onChange={(e) => handleFilterKeywordChamged(e.target.value)}
            />
            <div className="separator separator--vertical" />
            <Tooltip title="Reset">
                <button
                    className="story__button filter-bar__button-search"
                    onClick={() => handleResetKeyword()}
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

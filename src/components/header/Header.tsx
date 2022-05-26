import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@mui/material";
import { useEffect, useRef } from "react";
import useLocalStorageState from "../../hooks/useLocalStorage";
import { useStoryDispatch } from "../contexts/Story.context";
import "./Header.scss";

export default function Header() {
    const [filterKeyword, setFilterKeyword] =
        useLocalStorageState("filterKeyWord");
    const storyDispatch = useStoryDispatch();

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
        <div className="header">
            <div className="header__tools">
                <div className="header__tools-grid">
                    <input
                        ref={inputRef}
                        className="story__input header__search-bar"
                        placeholder="Filter stories by keyword"
                        type="text"
                        value={filterKeyword}
                        onChange={(e) =>
                            handleFilterKeywordChamged(e.target.value)
                        }
                    />
                    <div className="separator" />
                    <Tooltip title="Reset">
                        <button
                            className="story__button header__button-search"
                            onClick={() => handleResetKeyword()}
                        >
                            <FontAwesomeIcon
                                className="header__button-search-icon"
                                icon={faRotateLeft}
                            />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
function MutableRefObject<T>() {
    throw new Error("Function not implemented.");
}

function LegacyRef<T>(arg0: number) {
    throw new Error("Function not implemented.");
}


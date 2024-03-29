import "./SidebarOptions.scss";

import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Toggle from "../toggle/Toggle";
import { Tooltip } from "@mui/material";

interface SidebarOptionsProps {
    isFilterBarHidden: boolean;
    isSidebarHiddenOnItemClick: boolean;
    isKeywordSetAfterClick: boolean;

    onFilterBarHiddenToggled: (isHidden: boolean) => void;
    onHideSidebarOnItemClickToggled: (isHidden: boolean) => void;
    onKeywordSetAfterClickToggled: (isKeywordSet: boolean) => void;
}

export default function SidebarOptions({
    isFilterBarHidden,
    isSidebarHiddenOnItemClick,
    isKeywordSetAfterClick,
    onFilterBarHiddenToggled,
    onHideSidebarOnItemClickToggled,
    onKeywordSetAfterClickToggled,
}: SidebarOptionsProps) {
    const [isOptionsDropdownHidden, setIsOptionsDropdownHidden] = useState(true);

    const handleOptionsButtonClick = () => {
        setIsOptionsDropdownHidden(!isOptionsDropdownHidden);
    };

    const optionsDropdownContentClassNames = ["sidebar-options__dropdown-content"];
    isOptionsDropdownHidden &&
        optionsDropdownContentClassNames.push("sidebar-options__dropdown-content--visible");

    return (
        <div className="sidebar-options">
            <div className="sidebar-options__dropdown" onClick={handleOptionsButtonClick}>
                <label htmlFor="options" title="options">
                    Sidebar options
                </label>
                <button>
                    <FontAwesomeIcon icon={isOptionsDropdownHidden ? faCaretDown : faCaretUp} />
                </button>
            </div>
            <div className={optionsDropdownContentClassNames.join(" ")}>
                <div
                    className={`sidebar-options__dropdown-item ${
                        isFilterBarHidden ? "sidebar-options__dropdown-item--active" : ""
                    }`}
                >
                    <label
                        className="sidebar-options__label"
                        htmlFor="hideFilterBar"
                        title="Hide filter bar"
                    >
                        Hide filter bar
                    </label>
                    <Toggle
                        htmlFor="hideFilterBar"
                        isOn={isFilterBarHidden}
                        onToggle={(isOn) => onFilterBarHiddenToggled(isOn)}
                    />
                </div>
                <div
                    className={`sidebar-options__dropdown-item ${
                        isSidebarHiddenOnItemClick ? "sidebar-options__dropdown-item--active" : ""
                    }`}
                >
                    <label
                        className="sidebar-options__label"
                        htmlFor="hideOnItemClickToggle"
                        title="Hide sidebar on item click"
                    >
                        Hide sidebar after selecting an item
                    </label>
                    <Toggle
                        htmlFor="hideOnItemClickToggle"
                        isOn={isSidebarHiddenOnItemClick}
                        onToggle={(isOn) => onHideSidebarOnItemClickToggled(isOn)}
                    />
                </div>
                <div
                    className={`sidebar-options__dropdown-item ${
                        isKeywordSetAfterClick && !isFilterBarHidden
                            ? "sidebar-options__dropdown-item--active"
                            : ""
                    }`}
                >
                    <label
                        className={`sidebar-options__label ${
                            isFilterBarHidden ? "sidebar-options__label--disabled" : ""
                        }`}
                        htmlFor="setKeywordFilterAfterStoryClick"
                        title="Set filter keyword after clicking on an item"
                    >
                        Set filter keyword after selecting an item
                    </label>
                    <Tooltip
                        arrow
                        title={isFilterBarHidden ? "Disabled when filter bar is hidden" : ""}
                    >
                        <Toggle
                            htmlFor="setKeywordFilterAfterStoryClick"
                            isDisabled={isFilterBarHidden}
                            isOn={isKeywordSetAfterClick && !isFilterBarHidden}
                            onToggle={(isOn) => onKeywordSetAfterClickToggled(isOn)}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

import "./SidebarOptions.scss";

import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Toggle from "../utilities/Toggle";

interface SidebarOptionsProps {
    isFilterBarHidden: boolean;
    isSidebarHiddenOnItemClick: boolean;
    onFilterbarHiddenToggled: (isHidden: boolean) => void;
    onHideSidebarOnItemClickToggled: (isHidden: boolean) => void;
}

export default function SidebarOptions({
    isFilterBarHidden,
    isSidebarHiddenOnItemClick,
    onFilterbarHiddenToggled,
    onHideSidebarOnItemClickToggled,
}: SidebarOptionsProps) {
    const [isOptionsDropdownHidden, setIsOptionsDropdownHidden] =
        useState(true);

    const handleOptionsButtonClick = () => {
        setIsOptionsDropdownHidden(!isOptionsDropdownHidden);
    };

    const optionsDropdownClassNames = ["sidebar-options__dropdown-content"];
    isOptionsDropdownHidden &&
        optionsDropdownClassNames.push(
            "sidebar-options__dropdown-content--hidden"
        );

    return (
        <div className="sidebar-options">
            <div
                className="sidebar-options__dropdown"
                onClick={handleOptionsButtonClick}
            >
                <label htmlFor="options" title="options">
                    Options
                </label>
                <button>
                    <FontAwesomeIcon
                        icon={isOptionsDropdownHidden ? faCaretDown : faCaretUp}
                    />
                </button>
            </div>
            <div className={optionsDropdownClassNames.join(" ")}>
                <div
                    className={`sidebar-options__dropdown-item ${
                        isFilterBarHidden &&
                        "sidebar-options__dropdown-item--active"
                    }`}
                >
                    <label htmlFor="hideFilterBar" title="Hide filter bar">
                        Hide filter bar
                    </label>
                    <Toggle
                        htmlFor="hideFilterBar"
                        isOn={isFilterBarHidden}
                        onToggle={(isOn) => onFilterbarHiddenToggled(isOn)}
                    />
                </div>
                <div
                    className={`sidebar-options__dropdown-item ${
                        isSidebarHiddenOnItemClick &&
                        "sidebar-options__dropdown-item--active"
                    }`}
                >
                    <label
                        htmlFor="hideOnItemClickToggle"
                        title="Hide sidebar on item click"
                    >
                        Hide sidebar on story click
                    </label>
                    <Toggle
                        htmlFor="hideOnItemClickToggle"
                        isOn={isSidebarHiddenOnItemClick}
                        onToggle={(isOn) =>
                            onHideSidebarOnItemClickToggled(isOn)
                        }
                    />
                </div>
            </div>
        </div>
    );
}

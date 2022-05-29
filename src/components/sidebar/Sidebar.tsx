import "./Sidebar.scss";
import "../../styles/Styles.scss";

import {
    faCaretDown,
    faCaretUp,
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useStoryState } from "../contexts/Story.context";
import SidebarItem from "./SidebarItem";
import useScroll from "../../hooks/useScroll";
import FilterBar from "./FilterBar";
import Toggle from "../utilities/Toggle";
import useLocalStorageState from "../../hooks/useLocalStorage";

export default function Sidebar() {
    const storyState = useStoryState();
    const { scrollPosition, scrollHeight } = useScroll(window);
    const [isSidebarHiddenOnItemClick, setIsSidebarHiddenOnItemClick] =
        useLocalStorageState("hideSidebarOnStoryClick", "false");
    const [isFilterBarHidden, setIsFilterBarHidden] = useLocalStorageState(
        "isFilterbarHidden",
        "false"
    );

    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [activeItemIndex, setActiveItemIndex] = useState<
        number | undefined
    >();
    const [isOptionsDropdownHidden, setIsOptionsDropdownHidden] =
        useState(true);

    useEffect(() => {
        if (storyState.visibleStoryNames.length === 1) {
            setActiveItemIndex(0);
            return;
        }

        if (
            scrollPosition === scrollHeight ||
            scrollHeight - scrollPosition <= 3
        ) {
            setActiveItemIndex(storyState.visibleStoryNames?.length - 1);
            return;
        }

        storyState.visibleStoryNames.forEach((storyName, index) => {
            const storyElement = document.getElementById(storyName);

            if (storyElement) {
                const elementPosition = storyElement.getBoundingClientRect();

                if (
                    (elementPosition.bottom > 0 && elementPosition.top < 0) ||
                    (elementPosition.top <= 1 && elementPosition.top >= 0)
                ) {
                    setActiveItemIndex(index);
                }
            }
        });
    }, [scrollPosition, storyState.visibleStoryNames]);

    const handleToggleSidebarNav = () => {
        setIsSidebarHidden(!isSidebarHidden);
    };

    const handleScrollToStoryAnchor = (storyName: string) => {
        const anchor = document.getElementById(storyName);

        anchor &&
            anchor.scrollIntoView({
                behavior: "smooth",
            });

        isSidebarHiddenOnItemClick && setIsSidebarHidden(true);
    };

    const handleOptionsButtonClick = () => {
        setIsOptionsDropdownHidden(!isOptionsDropdownHidden);
    };

    const sidebarClassNames = ["sidebar"];
    isSidebarHidden && sidebarClassNames.push("sidebar--closed");

    const sidebarPusherClassNames = ["sidebar__pusher"];
    isSidebarHidden && sidebarPusherClassNames.push("sidebar__pusher--closed");

    const optionsDropdownClassNames = ["sidebar__options-dropdown-content"];
    isOptionsDropdownHidden &&
        optionsDropdownClassNames.push(
            "sidebar__options-dropdown-content--hidden"
        );

    return (
        <>
            <div className={sidebarPusherClassNames.join(" ")} />
            <div className={sidebarClassNames.join(" ")}>
                <div className="sidebar__border-left" />
                <div
                    className="sidebar__button-caret"
                    onClick={handleToggleSidebarNav}
                >
                    <FontAwesomeIcon
                        icon={
                            isSidebarHidden
                                ? faChevronCircleLeft
                                : faChevronCircleRight
                        }
                        size={"2x"}
                    />
                </div>
                <div className="sidebar__content">
                    <h2>Visible stories</h2>
                    {!isFilterBarHidden && <FilterBar />}
                    {storyState.visibleStoryNames.map((storyName, index) => {
                        return (
                            <div
                                key={storyName}
                                onClick={() =>
                                    handleScrollToStoryAnchor(storyName)
                                }
                            >
                                <SidebarItem
                                    isActive={activeItemIndex === index}
                                    storyName={storyName}
                                />
                            </div>
                        );
                    })}
                    <div className="separator separator--horizontal" />
                    <div className="sidebar__options">
                        <div
                            className="sidebar__options-dropdown"
                            onClick={handleOptionsButtonClick}
                        >
                            <label htmlFor="options" title="options">
                                Options
                            </label>
                            <button>
                                <FontAwesomeIcon
                                    icon={
                                        isOptionsDropdownHidden
                                            ? faCaretDown
                                            : faCaretUp
                                    }
                                />
                            </button>
                        </div>
                        <div className={optionsDropdownClassNames.join(" ")}>
                            <div
                                className={`sidebar__options-dropdown-item ${
                                    isFilterBarHidden &&
                                    "sidebar__options-dropdown-item--active"
                                }`}
                            >
                                <label
                                    htmlFor="hideFilterBar"
                                    title="Hide filter bar"
                                >
                                    Hide filter bar
                                </label>
                                <Toggle
                                    htmlFor="hideFilterBar"
                                    isOn={isFilterBarHidden}
                                    onToggle={(isOn) =>
                                        setIsFilterBarHidden(isOn)
                                    }
                                />
                            </div>
                            <div
                                className={`sidebar__options-dropdown-item ${
                                    isSidebarHiddenOnItemClick &&
                                    "sidebar__options-dropdown-item--active"
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
                                        setIsSidebarHiddenOnItemClick(isOn)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

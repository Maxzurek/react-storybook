import "./Sidebar.scss";
import "../../styles/GlobalStyles.scss";

import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
    useStorylineDispatch,
    useStorylineState,
} from "../contexts/Storyline.context";
import SidebarItem from "./SidebarItem";
import FilterBar from "./FilterBar";
import useLocalStorageState from "../../hooks/useLocalStorage";
import SidebarOptions from "./SidebarOptions";
import { Tooltip } from "@mui/material";

interface SidebarProps {
    scrollPosition: number;
    scrollHeight: number;
}

export default function Sidebar({
    scrollPosition,
    scrollHeight,
}: SidebarProps) {
    const [activeItemIndex, setActiveItemIndex] = useState<
        number | undefined
    >();

    const { storylines } = useStorylineState();
    const storylineDispatch = useStorylineDispatch();
    const [filterKeyword, setFilterKeyword] =
        useLocalStorageState("filterKeyWord");
    const [isSidebarHidden, setIsSidebarHidden] = useLocalStorageState(
        "isSideBarHidden",
        "false"
    );
    const [isSidebarHiddenOnItemClick, setIsSidebarHiddenOnItemClick] =
        useLocalStorageState("hideSidebarOnStoryClick", "false");
    const [isFilterBarHidden, setIsFilterBarHidden] = useLocalStorageState(
        "isFilterbarHidden",
        "false"
    );
    const [isKeywordSetAfterClick, setIsKeywordSetAfterClick] =
        useLocalStorageState("isKeywordSetAfterClick", "false");

    const contentBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (storylines.length === 1 || scrollPosition === 0) {
            setActiveItemIndex(0);
            return;
        }

        if (
            scrollPosition === scrollHeight ||
            scrollHeight - scrollPosition <= 3
        ) {
            setActiveItemIndex(storylines.length - 1);
            return;
        }

        for (let index = 0; index < storylines.length; index++) {
            const { storyName } = storylines[index];
            const storyElement = document.getElementById(storyName);

            if (storyElement) {
                const elementRect = storyElement?.getBoundingClientRect();
                if (
                    scrollPosition <=
                        storyElement.offsetTop + elementRect.height &&
                    scrollPosition >= storyElement.offsetTop
                ) {
                    setActiveItemIndex(index);
                    break;
                }
            }
        }
    }, [scrollPosition, storylines, scrollHeight]);

    useEffect(() => {
        storylineDispatch({
            type: "filterStoriesByKeyword",
            payload: filterKeyword,
        });
    }, [filterKeyword]);

    const handleToggleSidebarNav = () => {
        setIsSidebarHidden(!isSidebarHidden);
    };

    const handleSidebarItemClick = (storyName: string) => {
        if (isKeywordSetAfterClick) {
            setFilterKeyword(storyName);
            storylineDispatch({
                type: "filterStoriesByKeyword",
                payload: storyName,
            });
            isSidebarHiddenOnItemClick && setIsSidebarHidden(true);
            return;
        } else {
            const anchor = document.getElementById(storyName);

            if (isSidebarHiddenOnItemClick) {
                setIsSidebarHidden(true);

                // When hiding the sidebar, in our css, the transition delay is set to 500ms.
                // We need to wait for the sidebar to close before scrolling to the element,
                // the reason beeing the div the element is inside of is a flex container.
                // When the sidebar is visible, it compresses the div and changes its height,
                // resulting in a polymorphic anchor positon
                const sidebarHiddenTransitionDelay = 550;
                setTimeout(() => {
                    anchor?.scrollIntoView();
                }, sidebarHiddenTransitionDelay);
            } else {
                anchor?.scrollIntoView();
            }
        }
    };

    const handleFilterKeywordChanged = (filterKeyword: string) => {
        setFilterKeyword(filterKeyword);
    };

    const handleResetFilterKeyword = () => {
        setFilterKeyword("");
    };

    const handleSideBarItemActive = (
        activeItemRef: MutableRefObject<HTMLDivElement | null>
    ) => {
        if (activeItemRef.current && contentBodyRef.current) {
            contentBodyRef.current.scrollTop =
                activeItemRef.current.offsetTop -
                contentBodyRef.current.offsetTop;
        }
    };

    const sidebarClassNames = ["sidebar"];
    isSidebarHidden && sidebarClassNames.push("sidebar--closed");

    const sidebarPusherClassNames = ["sidebar__pusher"];
    isSidebarHidden && sidebarPusherClassNames.push("sidebar__pusher--closed");

    return (
        <>
            <div className={sidebarPusherClassNames.join(" ")} />
            <div className={sidebarClassNames.join(" ")}>
                <div className="sidebar__border-left" />
                <div
                    className="sidebar__button-caret"
                    onClick={handleToggleSidebarNav}
                >
                    <Tooltip
                        arrow
                        placement={"left"}
                        title={
                            isSidebarHidden ? "Show sidebar" : "Hide sidebar"
                        }
                    >
                        <div>
                            <FontAwesomeIcon
                                icon={
                                    isSidebarHidden
                                        ? faChevronCircleLeft
                                        : faChevronCircleRight
                                }
                                size={"2x"}
                            />
                        </div>
                    </Tooltip>
                </div>
                <div className="sidebar__content">
                    <div className="sidebar__content-header">
                        <div>
                            {!isFilterBarHidden && (
                                <FilterBar
                                    filterKeyword={filterKeyword}
                                    onChange={handleFilterKeywordChanged}
                                    onReset={handleResetFilterKeyword}
                                />
                            )}
                            <h2>Visible stories</h2>
                        </div>
                    </div>
                    <div ref={contentBodyRef} className="sidebar__content-body">
                        {storylines.map(({ storyName }, index) => {
                            return (
                                <SidebarItem
                                    key={storyName}
                                    isActive={activeItemIndex === index}
                                    storyName={storyName}
                                    onClick={() =>
                                        handleSidebarItemClick(storyName)
                                    }
                                    onSidebarItemActive={
                                        handleSideBarItemActive
                                    }
                                />
                            );
                        })}
                    </div>
                    <div className="separator separator--horizontal" />
                    <div className="sidebar__content-footer">
                        <SidebarOptions
                            isFilterBarHidden={isFilterBarHidden}
                            isKeywordSetAfterClick={isKeywordSetAfterClick}
                            isSidebarHiddenOnItemClick={
                                isSidebarHiddenOnItemClick
                            }
                            onFilterbarHiddenToggled={(isHidden) => {
                                setIsFilterBarHidden(isHidden);
                                setIsKeywordSetAfterClick(false);
                            }}
                            onHideSidebarOnItemClickToggled={(isHidden) =>
                                setIsSidebarHiddenOnItemClick(isHidden)
                            }
                            onKeywordSetAfterClickToggled={(isKeywordSet) =>
                                setIsKeywordSetAfterClick(isKeywordSet)
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

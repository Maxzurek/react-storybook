import "./Sidebar.scss";
import "../../styles/Styles.scss";

import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
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

        storylines.forEach(({ storyName }, index) => {
            const storyElement = document.getElementById(storyName);

            if (storyElement) {
                if (storyElement.offsetTop <= scrollPosition) {
                    setActiveItemIndex(index);
                }
            }
        });
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
        isSidebarHiddenOnItemClick && setIsSidebarHidden(true);

        if (isKeywordSetAfterClick) {
            setFilterKeyword(storyName);
            storylineDispatch({
                type: "filterStoriesByKeyword",
                payload: storyName,
            });
            return;
        }

        const anchor = document.getElementById(storyName);

        anchor &&
            anchor.scrollIntoView({
                behavior: "smooth",
            });
    };

    const handleFilterKeywordChanged = (filterKeyword: string) => {
        setFilterKeyword(filterKeyword);
    };

    const handleResetFilterKeyword = () => {
        setFilterKeyword("");
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
                    {!isFilterBarHidden && (
                        <FilterBar
                            filterKeyword={filterKeyword}
                            onChange={handleFilterKeywordChanged}
                            onReset={handleResetFilterKeyword}
                        />
                    )}
                    <h2>Visible stories</h2>
                    {storylines.map(({ storyName }, index) => {
                        return (
                            <SidebarItem
                                key={storyName}
                                isActive={activeItemIndex === index}
                                storyName={storyName}
                                onClick={() =>
                                    handleSidebarItemClick(storyName)
                                }
                            />
                        );
                    })}
                    <div className="separator separator--horizontal" />
                    <SidebarOptions
                        isFilterBarHidden={isFilterBarHidden}
                        isKeywordSetAfterClick={isKeywordSetAfterClick}
                        isSidebarHiddenOnItemClick={isSidebarHiddenOnItemClick}
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
        </>
    );
}

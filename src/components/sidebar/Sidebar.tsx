import "./Sidebar.scss";
import "../../styles/GlobalStyles.scss";

import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject, useEffect, useRef, useState } from "react";
import {
    useStorylineDispatch,
    useStorylineState,
} from "../contexts/Storyline.context";
import SidebarItem from "./SidebarItem";
import FilterBar from "./FilterBar";
import useLocalStorageState from "../../hooks/useLocalStorage";
import SidebarOptions from "./SidebarOptions";
import { Tooltip } from "@mui/material";
import useScroll from "../../hooks/useScroll";
import { StoryRef } from "../story/Story";
import React from "react";

interface SidebarProps {
    storyContainerDivRef: RefObject<HTMLDivElement>;
    storyRefMap: Map<string, StoryRef>;
}

export default function Sidebar({
    storyContainerDivRef,
    storyRefMap,
}: SidebarProps) {
    const { scrollPosition, scrollHeight } = useScroll(storyContainerDivRef);
    const { storylines } = useStorylineState();
    const storylineDispatch = useStorylineDispatch();
    const [filterKeyword, setFilterKeyword] =
        useLocalStorageState("filterKeyWord");
    const [isSidebarHiddenOnItemClick, setIsSidebarHiddenOnItemClick] =
        useLocalStorageState("hideSidebarOnStoryClick", "false");
    const [isFilterBarHidden, setIsFilterBarHidden] = useLocalStorageState(
        "isFilterBarHidden",
        "false"
    );
    const [isKeywordSetAfterClick, setIsKeywordSetAfterClick] =
        useLocalStorageState("isKeywordSetAfterClick", "false");

    const [isScrollingDisable, setIsScrollingDisable] = useState(false);
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);

    const contentBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        storylineDispatch({
            type: "filterStoriesByKeyword",
            payload: filterKeyword,
        });
    }, [filterKeyword, storylineDispatch]);

    const handleToggleSidebarNav = () => {
        setIsSidebarHidden(!isSidebarHidden);
    };

    const handleSidebarItemClick = (storyId: string, storyName: string) => {
        if (isSidebarHiddenOnItemClick) {
            setIsSidebarHidden(true);
        }
        if (isKeywordSetAfterClick) {
            setFilterKeyword(storyName);
            storylineDispatch({
                type: "filterStoriesByKeyword",
                payload: storyName,
            });
            return;
        }

        // contentBodyRef.current.style.overflow = "hidden";
        setIsScrollingDisable(true);

        storyRefMap.get(storyId)?.scrollIntoView(() => {
            // contentBodyRef.current.style.overflow = "scroll";
            setIsScrollingDisable(false);
        });
    };

    const handleFilterKeywordChanged = (filterKeyword: string) => {
        setFilterKeyword(filterKeyword);
    };

    const handleResetFilterKeyword = () => {
        setFilterKeyword("");
    };

    const handleFilterBarHiddenToggled = (isHidden: boolean) => {
        setIsFilterBarHidden(isHidden);
        setIsKeywordSetAfterClick(false);
        setFilterKeyword("");
    };

    const handleHideSidebarOnItemClickToggled = (isHidden: boolean) => {
        setIsSidebarHiddenOnItemClick(isHidden);
    };

    const handleKeywordSetAfterClickToggled = (isKeywordSet: boolean) => {
        setIsKeywordSetAfterClick(isKeywordSet);
    };

    const sidebarPusherClassNames = ["sidebar__pusher"];
    isSidebarHidden && sidebarPusherClassNames.push("sidebar__pusher--closed");

    const sidebarClassNames = ["sidebar"];
    isSidebarHidden && sidebarClassNames.push("sidebar--closed");

    return (
        <>
            <div className={sidebarPusherClassNames.join(" ")} />
            <div className={sidebarClassNames.join(" ")}>
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
                <div className={"sidebar__border-left"} />
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
                        {storylines?.map(({ storyName, id }, index) => {
                            return (
                                <React.Fragment key={id}>
                                    <SidebarItem
                                        isActive={
                                            isSidebarItemActive(
                                                storylines.length,
                                                index,
                                                storyRefMap.get(id)
                                                    ?.storyDivElement,
                                                scrollPosition,
                                                scrollHeight
                                            ) && !isSidebarHidden
                                        }
                                        isAutoScrollDisabled={
                                            isScrollingDisable
                                        }
                                        storyName={storyName}
                                        onClick={() =>
                                            handleSidebarItemClick(
                                                id,
                                                storyName
                                            )
                                        }
                                    />
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="separator separator--horizontal" />
                    <div className="sidebar__content-footer">
                        <SidebarOptions
                            isFilterBarHidden={Boolean(isFilterBarHidden)}
                            isKeywordSetAfterClick={isKeywordSetAfterClick}
                            isSidebarHiddenOnItemClick={Boolean(
                                isSidebarHiddenOnItemClick
                            )}
                            onFilterBarHiddenToggled={
                                handleFilterBarHiddenToggled
                            }
                            onHideSidebarOnItemClickToggled={
                                handleHideSidebarOnItemClickToggled
                            }
                            onKeywordSetAfterClickToggled={
                                handleKeywordSetAfterClickToggled
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

const isSidebarItemActive = (
    storylinesLength: number,
    currentIndex: number,
    sidebarItemDivElement: HTMLDivElement,
    scrollPosition: number,
    scrollHeight: number
) => {
    if (!sidebarItemDivElement) return false;

    const isScrollTop = scrollPosition === 0;
    const isScrollBottom = scrollPosition === scrollHeight;
    const isFirstItem = currentIndex === 0;
    const isLastItem = storylinesLength - 1 === currentIndex;
    const topOffsetError = 5;

    if (sidebarItemDivElement.clientHeight === 0) return false;
    if (isScrollBottom && !isLastItem) return false;
    if (isScrollTop && isFirstItem) return true;
    if (isScrollBottom && isLastItem) return true;
    if (
        scrollPosition <=
            sidebarItemDivElement.offsetTop +
                sidebarItemDivElement.clientHeight &&
        scrollPosition >= sidebarItemDivElement.offsetTop - topOffsetError
    ) {
        return true;
    }

    return false;
};

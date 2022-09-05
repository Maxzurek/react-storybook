import "./Sidebar.scss";
import "../../styles/GlobalStyles.scss";

import { faChevronCircleLeft, faChevronCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject, useEffect, useRef, useState } from "react";
import { useStorylineDispatch, useStorylineState } from "../contexts/Storyline.context";
import SidebarItem from "./SidebarItem";
import FilterBar from "./FilterBar";
import useLocalStorageState from "../../hooks/useLocalStorage";
import SidebarOptions from "./SidebarOptions";
import { Tooltip } from "@mui/material";
import useScroll from "../../hooks/useScroll";
import { StoryRef } from "../story/Story";
import React from "react";
import useScrollUntilVisible from "../../hooks/useScrollUntilVisible";

interface SidebarProps {
    storyContainerDivRef: RefObject<HTMLDivElement>;
    storyRefMap: Map<string, StoryRef>;
}

export default function Sidebar({ storyContainerDivRef, storyRefMap }: SidebarProps) {
    const { storylines } = useStorylineState();
    const { scrollPosition } = useScroll(storyContainerDivRef);
    const storylineDispatch = useStorylineDispatch();
    const [filterKeyword, setFilterKeyword] = useLocalStorageState("filterKeyWord");
    const [isSidebarHiddenOnItemClick, setIsSidebarHiddenOnItemClick] = useLocalStorageState(
        "hideSidebarOnStoryClick",
        "false"
    );
    const [isFilterBarHidden, setIsFilterBarHidden] = useLocalStorageState(
        "isFilterBarHidden",
        "false"
    );
    const [isKeywordSetAfterClick, setIsKeywordSetAfterClick] = useLocalStorageState(
        "isKeywordSetAfterClick",
        "false"
    );
    const { scrollElementIntoView } = useScrollUntilVisible();

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

        setIsScrollingDisable(true);

        scrollElementIntoView(storyRefMap.get(storyId).storyDivElement, {
            scrollArgs: { behavior: "smooth" },
        }).then(() => {
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
                <div className="sidebar__button-caret" onClick={handleToggleSidebarNav}>
                    <Tooltip
                        arrow
                        disableInteractive
                        placement={"left"}
                        title={isSidebarHidden ? "Show sidebar" : "Hide sidebar"}
                    >
                        <div>
                            <FontAwesomeIcon
                                icon={isSidebarHidden ? faChevronCircleLeft : faChevronCircleRight}
                                size={"2x"}
                            />
                        </div>
                    </Tooltip>
                </div>
                <div className="sidebar__border-left" />
                <div className="sidebar__header">
                    <div className="sidebar__filter-bar">
                        {!isFilterBarHidden && (
                            <FilterBar
                                filterKeyword={filterKeyword}
                                onChange={handleFilterKeywordChanged}
                                onReset={handleResetFilterKeyword}
                            />
                        )}
                    </div>
                    <div className="sidebar__title">
                        <span>Visible stories</span>
                    </div>
                    <div className="separator separator--horizontal" />
                </div>
                <div ref={contentBodyRef} className="sidebar__body">
                    {storylines?.map(({ storyName, id }, index) => {
                        return (
                            <React.Fragment key={id}>
                                <SidebarItem
                                    isActive={
                                        isSidebarItemActive(
                                            index,
                                            storyRefMap.get(id)?.storyDivElement,
                                            scrollPosition
                                        ) && !isSidebarHidden
                                    }
                                    isAutoScrollDisabled={isScrollingDisable}
                                    storyName={storyName}
                                    onClick={() => handleSidebarItemClick(id, storyName)}
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
                <div className="separator separator--horizontal" />
                <div className="sidebar__footer">
                    <SidebarOptions
                        isFilterBarHidden={Boolean(isFilterBarHidden)}
                        isKeywordSetAfterClick={isKeywordSetAfterClick}
                        isSidebarHiddenOnItemClick={Boolean(isSidebarHiddenOnItemClick)}
                        onFilterBarHiddenToggled={handleFilterBarHiddenToggled}
                        onHideSidebarOnItemClickToggled={handleHideSidebarOnItemClickToggled}
                        onKeywordSetAfterClickToggled={handleKeywordSetAfterClickToggled}
                    />
                </div>
            </div>
        </>
    );
}

const isSidebarItemActive = (
    currentIndex: number,
    sidebarItemDivElement: HTMLDivElement,
    scrollPosition: number
) => {
    if (!sidebarItemDivElement) return false;

    const topOffsetMargin = 20;
    const isScrollTop = scrollPosition <= topOffsetMargin;
    const isFirstItem = currentIndex === 0;

    if (isScrollTop && isFirstItem) return true;
    if (
        scrollPosition <= sidebarItemDivElement.offsetTop + sidebarItemDivElement.clientHeight &&
        scrollPosition >= sidebarItemDivElement.offsetTop
    ) {
        return true;
    }

    return false;
};

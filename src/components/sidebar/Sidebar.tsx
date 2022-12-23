import "./Sidebar.scss";
import "../../styles/GlobalStyles.scss";

import { faChevronCircleLeft, faChevronCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefObject, useRef } from "react";
import { useStorylineDispatch, useStorylineState } from "../contexts/Storyline.context";
import SidebarItem, { SidebarItemRef } from "./SidebarItem";
import FilterInput from "./FilterBar";
import useLocalStorageState from "../../hooks/useLocalStorage";
import SidebarOptions from "./SidebarOptions";
import { Tooltip } from "@mui/material";
import useScroll from "../../hooks/useScroll";
import { StoryRef } from "../story/Story";
import React from "react";
import ExpandableDiv from "../storylines/expandableDiv/ExpandableDiv";
import useRefMap from "../../hooks/useRefMap";
import useDebounceCallback from "../../hooks/useDebounceCallback";
import { appStoryContainerPadding } from "../../App";

const sidebarAnimationDuration = 500;

interface SidebarProps {
    storyContainerDivRef: RefObject<HTMLDivElement>;
    storyRefMap: Map<string, StoryRef>;
}

export default function Sidebar({ storyContainerDivRef, storyRefMap }: SidebarProps) {
    const { storylines } = useStorylineState();
    const { scrollPosition } = useScroll(storyContainerDivRef);
    const storylineDispatch = useStorylineDispatch();
    const [filterKeyword, setFilterKeyword] = useLocalStorageState("filterKeyWord", "");
    const [isSidebarHiddenOnItemClick, setIsSidebarHiddenOnItemClick] = useLocalStorageState(
        "hideSidebarOnStoryClick",
        false
    );
    const [isFilterBarHidden, setIsFilterBarHidden] = useLocalStorageState(
        "isFilterBarHidden",
        false
    );
    const [isKeywordSetAfterClick, setIsKeywordSetAfterClick] = useLocalStorageState(
        "isKeywordSetAfterClick",
        false
    );
    const [isSidebarHidden, setIsSidebarHidden] = useLocalStorageState("isSidebarHidden", false);
    const { setRefMap: setSidebarItemRefMap, getRef: getSideBarItemRef } =
        useRefMap<SidebarItemRef>();
    const debouncedDispatchFilterKeyword = useDebounceCallback();
    const debouncedFocusFilterBar = useDebounceCallback();

    /**
     * The slide-left className modifier translates the sidebar to the left on the x axis,
     * preventing the expandable div from determining it's scroll width if the sidebar is closed and the page is loaded for the first time
     */
    const isFirstRenderRef = useRef(true);
    const isFilterBarFocusedRef = useRef(false);
    const contentBodyRef = useRef<HTMLDivElement>(null);
    const storyIdToScrollIntoViewRef = useRef("");
    const filterInputRef = useRef<HTMLInputElement>();

    const handleToggleSidebarNav = () => {
        setIsSidebarHidden(!isSidebarHidden);
    };

    const handleSetFilterKeyword = (filterKeyword: string) => {
        setFilterKeyword(filterKeyword);
        storylineDispatch({
            type: "filterStoriesByKeyword",
            payload: filterKeyword,
        });
    };

    const handleSidebarItemClick = (storyId: string, storyName: string) => () => {
        storyIdToScrollIntoViewRef.current = storyId;

        let isScrollIntoViewNeeded = true;

        if (isSidebarHiddenOnItemClick) {
            setIsSidebarHidden(true);
            isScrollIntoViewNeeded = false;
        }

        if (isKeywordSetAfterClick) {
            handleSetFilterKeyword(storyName);
        }

        if (isScrollIntoViewNeeded) {
            handleScrollStoryIntoView(storyId);
        }
    };

    const handleFilterKeywordChanged = (filterKeyword: string) => {
        const setDispatchFilterKeywordDelay = 300;
        const focusDebounceDelay = setDispatchFilterKeywordDelay + 400;

        setFilterKeyword(filterKeyword);
        debouncedDispatchFilterKeyword(() => {
            storylineDispatch({
                type: "filterStoriesByKeyword",
                payload: filterKeyword,
            });
        }, setDispatchFilterKeywordDelay);
        debouncedFocusFilterBar(() => {
            filterInputRef.current.focus();
        }, focusDebounceDelay);
    };

    const handleResetFilterKeyword = () => {
        handleSetFilterKeyword("");
        isFilterBarFocusedRef.current = false;
    };

    const handleFilterBarHiddenToggled = (isHidden: boolean) => {
        setIsFilterBarHidden(isHidden);
        setIsKeywordSetAfterClick(false);
        handleSetFilterKeyword("");
    };

    const handleHideSidebarOnItemClickToggled = (isHidden: boolean) => {
        setIsSidebarHiddenOnItemClick(isHidden);
    };

    const handleKeywordSetAfterClickToggled = (isKeywordSet: boolean) => {
        setIsKeywordSetAfterClick(isKeywordSet);
    };

    const handleSidebarContainerRefCallback = (node: HTMLDivElement) => {
        if (node) {
            node.style.setProperty(
                "--sidebar-animation-duration",
                `${sidebarAnimationDuration / 1000}s`
            );
        }
    };

    const handleScrollStoryIntoView = (storyId: string) => {
        storyRefMap.get(storyId).storyDivElement?.scrollIntoView({ behavior: "smooth" });
    };

    const handleEndSidebarAnimation = () => {
        if (!storyIdToScrollIntoViewRef.current || !isSidebarHidden) {
            return;
        }

        handleScrollStoryIntoView(storyIdToScrollIntoViewRef.current);
    };

    const handleSidebarItemActiveAndNotInViewport = (storyId: string) => {
        if (storyIdToScrollIntoViewRef.current) return;

        const sidebarItemRef = getSideBarItemRef(storyId);
        sidebarItemRef?.scrollIntoView();
    };

    const expandableDivClassNames = ["sidebar__expandable-div"];
    isSidebarHidden && expandableDivClassNames.push("sidebar__expandable-div--closed");

    const containerClassNames = ["sidebar__container"];
    !isFirstRenderRef.current &&
        isSidebarHidden &&
        containerClassNames.push("sidebar__container--slide-left");

    isFirstRenderRef.current = false;

    return (
        <div className="sidebar">
            <ExpandableDiv
                animationDuration={sidebarAnimationDuration}
                className={expandableDivClassNames.join(" ")}
                expansionDirection="horizontal"
                isExpanded={!isSidebarHidden}
                onAnimationEnd={handleEndSidebarAnimation}
            >
                <div
                    ref={handleSidebarContainerRefCallback}
                    className={containerClassNames.join(" ")}
                >
                    <div className="sidebar__header">
                        <div className="sidebar__title">
                            <span>Visible stories</span>
                        </div>
                        <div className="sidebar__filter-bar">
                            {!isFilterBarHidden && (
                                <FilterInput
                                    ref={filterInputRef}
                                    filterKeyword={filterKeyword}
                                    onChange={handleFilterKeywordChanged}
                                    onReset={handleResetFilterKeyword}
                                />
                            )}
                        </div>
                        <div className="separator separator--horizontal" />
                    </div>
                    <div ref={contentBodyRef} className="sidebar__body">
                        {storylines?.map(({ storyName, id }, index) => {
                            const isItemActive = isSidebarItemActive(
                                index,
                                storyRefMap.get(id)?.storyDivElement,
                                scrollPosition
                            );
                            const wasItemScrolledIntoView =
                                storyIdToScrollIntoViewRef.current === id;

                            if (isItemActive && wasItemScrolledIntoView) {
                                storyIdToScrollIntoViewRef.current = "";
                            }

                            return (
                                <React.Fragment key={id}>
                                    <SidebarItem
                                        ref={(ref) => setSidebarItemRefMap(id, ref)}
                                        isActive={
                                            (scrollPosition === 0 && index === 0) || isItemActive
                                        }
                                        storyId={id}
                                        storyName={storyName}
                                        onActiveAndNotInViewport={
                                            handleSidebarItemActiveAndNotInViewport
                                        }
                                        onClick={handleSidebarItemClick(id, storyName)}
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
            </ExpandableDiv>
            <div className="sidebar__border">
                <div className="sidebar__border-button-caret" onClick={handleToggleSidebarNav}>
                    <Tooltip
                        arrow
                        disableInteractive
                        placement="right"
                        title={isSidebarHidden ? "Show sidebar" : "Hide sidebar"}
                    >
                        <div>
                            <FontAwesomeIcon
                                icon={isSidebarHidden ? faChevronCircleRight : faChevronCircleLeft}
                                size={"2x"}
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
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

    if (isScrollTop && isFirstItem) {
        return true;
    }
    if (
        scrollPosition <=
            sidebarItemDivElement.offsetTop +
                sidebarItemDivElement.clientHeight +
                appStoryContainerPadding &&
        scrollPosition >= sidebarItemDivElement.offsetTop
    ) {
        return true;
    }

    return false;
};

import "./Sidebar.scss";
import "../../styles/GlobalStyles.scss";

import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MutableRefObject, useEffect, useRef } from "react";
import {
    useStorylineDispatch,
    useStorylineState,
} from "../contexts/Storyline.context";
import SidebarItem from "./SidebarItem";
import FilterBar from "./FilterBar";
import useLocalStorageState from "../../hooks/useLocalStorage";
import SidebarOptions from "./SidebarOptions";
import { Tooltip } from "@mui/material";
import { StoryRef } from "../../interfaces/Story.interfaces";

interface SidebarProps {
    scrollPosition: number;
    scrollHeight: number;
}

export default function Sidebar({
    scrollPosition,
    scrollHeight,
}: SidebarProps) {
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
        "isFilterBarHidden",
        "false"
    );
    const [isKeywordSetAfterClick, setIsKeywordSetAfterClick] =
        useLocalStorageState("isKeywordSetAfterClick", "false");

    const contentBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        storylineDispatch({
            type: "filterStoriesByKeyword",
            payload: filterKeyword,
        });
    }, [filterKeyword]);

    const handleToggleSidebarNav = () => {
        setIsSidebarHidden(!isSidebarHidden);
    };

    const handleSidebarItemClick = (
        storyName: string,
        storyDivElement: StoryRef | undefined
    ) => {
        return () => {
            if (isKeywordSetAfterClick) {
                setFilterKeyword(storyName);
                storylineDispatch({
                    type: "filterStoriesByKeyword",
                    payload: storyName,
                });
                isSidebarHiddenOnItemClick && setIsSidebarHidden(true);
                return;
            } else {
                if (isSidebarHiddenOnItemClick) {
                    setIsSidebarHidden(true);
                }
            }
            storyDivElement?.scrollTop(isSidebarHiddenOnItemClick);
        };
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
                        {storylines?.map(({ storyName, storyRef }, index) => {
                            return (
                                <SidebarItem
                                    key={storyName}
                                    isActive={isSidebarItemActive(
                                        storylines.length,
                                        index,
                                        storyRef?.storyDivElement,
                                        scrollPosition,
                                        scrollHeight
                                    )}
                                    storyName={storyName}
                                    onClick={handleSidebarItemClick(
                                        storyName,
                                        storyRef
                                    )}
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
                            isFilterBarHidden={Boolean(isFilterBarHidden)}
                            isKeywordSetAfterClick={isKeywordSetAfterClick}
                            isSidebarHiddenOnItemClick={Boolean(
                                isSidebarHiddenOnItemClick
                            )}
                            onFilterBarHiddenToggled={(isHidden) => {
                                setIsFilterBarHidden(isHidden);
                                setIsKeywordSetAfterClick(false);
                                setFilterKeyword("");
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

const isSidebarItemActive = (
    storylinesLength: number,
    currentIndex: number,
    ref: HTMLDivElement | null | undefined,
    scrollPosition: number,
    scrollHeight: number
) => {
    if (!ref) return false;

    const isScrollTop = scrollPosition === 0;
    const isScrollBottom = scrollPosition === scrollHeight;
    const isFirstItem = currentIndex === 0;
    const isLastItem = storylinesLength - 1 === currentIndex;
    const topOffsetError = 20;

    if (ref.clientHeight === 0) return false;
    if (isScrollBottom && !isLastItem) return false;
    if (isScrollTop && isFirstItem) return true;
    if (isScrollBottom && isLastItem) return true;
    if (
        scrollPosition <= ref.offsetTop + ref.clientHeight &&
        scrollPosition >= ref.offsetTop - topOffsetError
    ) {
        return true;
    }

    return false;
};

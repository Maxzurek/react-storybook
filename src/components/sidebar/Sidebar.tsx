import "./Sidebar.scss";
import "../../styles/Styles.scss";

import {
    faChevronCircleLeft,
    faChevronCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useStorylineState } from "../contexts/Storyline.context";
import SidebarItem from "./SidebarItem";
import useScroll from "../../hooks/useScroll";
import FilterBar from "./FilterBar";
import useLocalStorageState from "../../hooks/useLocalStorage";
import SidebarOptions from "./SidebarOptions";

export default function Sidebar() {
    const { storylines } = useStorylineState();
    const { scrollPosition, scrollHeight } = useScroll(window);
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

    const [activeItemIndex, setActiveItemIndex] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (storylines.length === 1) {
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
                const elementPosition = storyElement.getBoundingClientRect();

                if (
                    (elementPosition.bottom > 0 && elementPosition.top < 0) ||
                    (elementPosition.top <= 1 && elementPosition.top >= 0)
                ) {
                    setActiveItemIndex(index);
                }
            }
        });
    }, [scrollPosition, storylines]);

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
                    {storylines.map(({ storyName }, index) => {
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
                    <SidebarOptions
                        isFilterBarHidden={isFilterBarHidden}
                        isSidebarHiddenOnItemClick={isSidebarHiddenOnItemClick}
                        onFilterbarHiddenToggled={(isHidden) =>
                            setIsFilterBarHidden(isHidden)
                        }
                        onHideSidebarOnItemClickToggled={(isHidden) =>
                            setIsSidebarHiddenOnItemClick(isHidden)
                        }
                    />
                </div>
            </div>
        </>
    );
}

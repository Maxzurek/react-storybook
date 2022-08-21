import { useEffect, useRef } from "react";
import useIsInViewport from "../../hooks/useIsInViewport";
import "./SidebarItem.scss";
interface SidebarItemProps {
    storyName: string;
    isActive: boolean;
    isAutoScrollDisabled: boolean;
    onClick: () => void;
}

export default function SidebarItem({
    storyName: title,
    isActive,
    isAutoScrollDisabled,
    onClick: onClick,
}: SidebarItemProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const { isInViewport } = useIsInViewport(divRef.current);

    useEffect(() => {
        if (!isInViewport && isActive && !isAutoScrollDisabled) {
            divRef.current?.scrollIntoView();
        }
    }, [isActive, isAutoScrollDisabled, isInViewport]);

    const sideBarItemClassNames = ["sidebar-item"];
    isActive && sideBarItemClassNames.push("sidebar-item--active");

    return (
        <div
            ref={divRef}
            className={sideBarItemClassNames.join(" ")}
            onClick={onClick}
        >
            <span className="sidebar-item__title">{title}</span>
        </div>
    );
}

import { MutableRefObject, useEffect, useRef } from "react";
import "./SidebarItem.scss";

interface SidebarItemProps {
    storyName: string;
    isActive: boolean;

    onClick: () => void;
    onSidebarItemActive: (ref: MutableRefObject<HTMLDivElement | null>) => void;
}

export default function SidebarItem({
    storyName: title,
    isActive,
    onClick,
    onSidebarItemActive,
}: SidebarItemProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        isActive && onSidebarItemActive(ref);
    }, [isActive]);

    const sideBarItemClassNames = ["sidebar-item"];
    isActive && sideBarItemClassNames.push("sidebar-item--active");

    return (
        <div
            ref={ref}
            className={sideBarItemClassNames.join(" ")}
            onClick={onClick}
        >
            <span className="sidebar-item__title">{title}</span>
        </div>
    );
}

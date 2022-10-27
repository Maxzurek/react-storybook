import { forwardRef, useImperativeHandle, useRef } from "react";
import useIsInViewport from "../../hooks/useIsInViewport";
import "./SidebarItem.scss";

export interface SidebarItemRef {
    scrollIntoView: (arg?: boolean | ScrollIntoViewOptions) => void;
}
interface SidebarItemProps {
    storyId: string;
    storyName: string;
    isActive: boolean;
    onClick: () => void;
    onActiveAndNotInViewport: (id: string) => void;
}

const SidebarItem = forwardRef<SidebarItemRef, SidebarItemProps>(
    ({ storyId, storyName, isActive, onClick, onActiveAndNotInViewport }, ref) => {
        const divRef = useRef<HTMLDivElement>(null);
        const { isInViewport } = useIsInViewport(divRef.current);

        if (isActive && !isInViewport) {
            onActiveAndNotInViewport(storyId);
        }

        useImperativeHandle(ref, () => ({
            scrollIntoView: handleScrollIntoView,
        }));

        const handleScrollIntoView = (arg?: boolean | ScrollIntoViewOptions) => {
            divRef.current?.scrollIntoView(arg);
        };

        const sideBarItemClassNames = ["sidebar-item"];
        isActive && sideBarItemClassNames.push("sidebar-item--active");

        return (
            <div ref={divRef} className={sideBarItemClassNames.join(" ")} onClick={onClick}>
                <span className="sidebar-item__title">{storyName}</span>
            </div>
        );
    }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;

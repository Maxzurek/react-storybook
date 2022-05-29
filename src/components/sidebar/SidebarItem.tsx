import "./SidebarItem.scss";

interface SidebarItemProps {
    storyName: string;
    isActive?: boolean;
}

export default function SidebarItem({
    storyName: title,
    isActive,
}: SidebarItemProps) {
    const sideBarItemClassNames = ["sidebar-item"];
    isActive && sideBarItemClassNames.push("sidebar-item--active");

    return (
        <div className={sideBarItemClassNames.join(" ")}>
            <span className="sidebar-item__title">{title}</span>
        </div>
    );
}

import "./SidebarItem.scss";

interface SidebarItemProps {
    storyName: string;
    isActive: boolean;

    onClick: () => void;
}

export default function SidebarItem({
    storyName: title,
    isActive,
    onClick,
}: SidebarItemProps) {
    const sideBarItemClassNames = ["sidebar-item"];
    isActive && sideBarItemClassNames.push("sidebar-item--active");

    return (
        <div className={sideBarItemClassNames.join(" ")} onClick={onClick}>
            <span className="sidebar-item__title">{title}</span>
        </div>
    );
}

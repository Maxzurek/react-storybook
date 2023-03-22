import "./MuiMenuIndex.scss";

import { Checkbox, Divider } from "@mui/material";
import { useRef } from "react";
import StorybookContextMenu, { ContextMenuRef } from "./ContextMenu";
import StorybookMenu from "./Menu";
import StorybookMenuItem from "./MenuItem";
import { NestedMenuItem } from "./NestedMenuItem";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { generateRandomId } from "../../../utilities/Math.utils";

const menuItems = ["Item1", "Item2", "Item3", "Item4"];

export default function MuiMenuIndex() {
    const contextMenuRef = useRef<ContextMenuRef>(null);

    const handleContextMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        contextMenuRef.current?.open(e);
    };

    const renderMenuItems = () => (
        <>
            <>
                <StorybookMenuItem id="Fragment Item 1" title="Fragment Item 1" />
                <StorybookMenuItem id="Fragment Item 2" title="Fragment Item 2" />
                <Divider />
            </>
            <>
                <StorybookMenuItem id="Div Item 1" title="Div Item 1" />
                <StorybookMenuItem id="Div Item 2" title="Div Item 2" />
            </>
            <StorybookMenuItem disableCloseMenuOnClick disableTouchRipple id={generateRandomId()}>
                <p>Text</p>
                <Checkbox />
            </StorybookMenuItem>
            <NestedMenuItem id="Nested menu 1" title="Nested menu 1">
                <StorybookMenuItem id="Nested menu 1 Item 1" title="Nested menu 1 Item 1" />
                <StorybookMenuItem id="Nested menu 1 Item 2" title="Nested menu 1 Item 2" />
                <NestedMenuItem id="Nested nested menu 1" title="Nested nested menu 1">
                    <StorybookMenuItem
                        id="Nested nested menu 1 Item 1"
                        title="Nested nested menu 1 Item 1"
                    />
                </NestedMenuItem>
            </NestedMenuItem>
            <Divider />
            <StorybookMenuItem id="Regular Item 1" title="Regular Item 1" />
        </>
    );

    return (
        <div className="mui-menu">
            <div className="mui-menu__buttons">
                <StorybookMenu button={<button className="story__button">Open menu</button>}>
                    {menuItems.map((menuItem, index) => (
                        <StorybookMenuItem key={menuItem[index]} id={menuItem}>
                            {menuItem}
                        </StorybookMenuItem>
                    ))}
                </StorybookMenu>
            </div>
            <StorybookContextMenu ref={contextMenuRef}>{renderMenuItems()}</StorybookContextMenu>
            <div className="mui-menu__click-me" onContextMenu={handleContextMenu}>
                <span>Right click me!</span>
            </div>
        </div>
    );
}

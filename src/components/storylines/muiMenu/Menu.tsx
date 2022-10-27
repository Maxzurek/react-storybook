import {
    ButtonBaseActions,
    Divider,
    DividerProps,
    Menu,
    MenuItemProps,
    MenuProps,
} from "@mui/material";
import React, { forwardRef, Fragment, ReactFragment } from "react";
import { ReactElement, useState } from "react";
import useRefMap from "../../../hooks/useRefMap";
import { ContextMenuPosition, MenuClosedReason, MenuItemElement } from "./Menu.interfaces";
import StorybookMenuItem, { StorybookMenuItemProps } from "./MenuItem";
import { NestedMenuItem, NestedMenuItemProps } from "./NestedMenuItem";

export interface StorybookMenuProps extends Omit<MenuProps, "open"> {
    children: MenuItemElement;
    button?: JSX.Element;
    contextMenuPosition?: ContextMenuPosition;
    onClose?: (event: unknown, reason: MenuClosedReason) => void;
}

const StorybookMenu = forwardRef<HTMLDivElement, StorybookMenuProps>(
    ({ children, button, contextMenuPosition, onClose, ...menuProps }: StorybookMenuProps, ref) => {
        const { setRefMap: setActionsRefMap, getRefMap: getActionRefMap } =
            useRefMap<ButtonBaseActions>();

        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

        const handleCloseMenu = (event: unknown, reason: MenuClosedReason) => {
            setIsMenuOpen(false);
            setAnchorElement(null);
            onClose?.(event, reason);
        };

        const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            setAnchorElement(e.currentTarget);
            setIsMenuOpen(!isMenuOpen);
        };

        const handleContextMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            e.preventDefault();
            handleCloseMenu(e, "backdropClick");
        };

        const getClonedMenuItemElement = (
            menuItemElement: ReactElement<StorybookMenuItemProps>
        ) => {
            return React.cloneElement<StorybookMenuItemProps>(menuItemElement, {
                key: menuItemElement.props.id,
                action: (action) => setActionsRefMap(menuItemElement.props.id, action),
                onClick: (e) => {
                    if (!menuItemElement.props.disableCloseMenuOnClick) {
                        handleCloseMenu(e, "itemClick");
                    }
                    menuItemElement.props.onClick?.(e);
                },
            });
        };

        const getClonedNestedMenuItemElement = (
            nestedMenuItemElement: ReactElement<NestedMenuItemProps>
        ) => {
            let nestedMenuItemChildren: ReactElement<
                MenuItemProps | DividerProps | ReactFragment
            >[] = [];

            if (Array.isArray(nestedMenuItemElement.props?.children)) {
                nestedMenuItemChildren = nestedMenuItemElement.props?.children;
            } else if (nestedMenuItemElement.props?.children) {
                nestedMenuItemChildren.push(nestedMenuItemElement.props.children);
            }

            const clonedNestedMenuChildren = renderChildren(nestedMenuItemChildren);

            return React.cloneElement<NestedMenuItemProps>(nestedMenuItemElement, {
                key: nestedMenuItemElement.props.id,
                children: clonedNestedMenuChildren,
                action: (action) => setActionsRefMap(nestedMenuItemElement.props.id, action),
                getActionsMap: getActionRefMap,
            });
        };

        const renderChildren = (children: MenuItemElement) => {
            let childrenArray = [];

            if (!Array.isArray(children)) {
                childrenArray.push(children);
            } else {
                childrenArray = children;
            }

            const clonedChildren: ReactElement[] = [];

            for (const child of childrenArray) {
                if (!child) {
                    continue;
                }
                if (child.type === StorybookMenuItem) {
                    clonedChildren.push(getClonedMenuItemElement(child));
                } else if (child.type === NestedMenuItem) {
                    clonedChildren.push(getClonedNestedMenuItemElement(child));
                } else if (child.type === Fragment) {
                    if (child.props.children) {
                        const clonedFragmentChildren = renderChildren(child.props.children);
                        clonedChildren.push(...clonedFragmentChildren);
                    }
                } else if (child.type === Divider) {
                    clonedChildren.push(child);
                } else if (child.type === "div") {
                    clonedChildren.push(child);
                } else {
                    if (process.env.NODE_ENV !== "production") {
                        console.error(
                            "StorybookMenu only supports children of type <StorybookMenuItem />, <NestedMenuItem />, <Divider /> or <React.Fragment />." +
                                "Try wrapping your element with a <StorybookMenuItem />"
                        );
                    }
                    clonedChildren.push(child);
                }
            }

            return clonedChildren;
        };

        const renderButton = () => {
            return React.cloneElement(button, {
                onClick: handleButtonClick,
            });
        };

        return (
            <div>
                {button && renderButton()}
                <Menu
                    {...menuProps}
                    ref={ref}
                    anchorEl={anchorElement || menuProps.anchorEl}
                    anchorPosition={
                        contextMenuPosition
                            ? { top: contextMenuPosition.y, left: contextMenuPosition.x }
                            : undefined
                    }
                    disableEnforceFocus
                    disableRestoreFocus
                    MenuListProps={{
                        "aria-labelledby": "basic-button",
                    }}
                    open={!!anchorElement || !!menuProps.anchorEl || !!contextMenuPosition}
                    onClose={handleCloseMenu}
                    onContextMenu={handleContextMenu}
                >
                    {renderChildren(children)}
                </Menu>
            </div>
        );
    }
);

StorybookMenu.displayName = "StorybookMenu";
export default StorybookMenu;

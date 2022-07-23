import { Divider, DividerProps, Menu, MenuItemProps } from "@mui/material";
import React, { Fragment, ReactFragment } from "react";
import { ReactElement, useState } from "react";
import { generateRandomId } from "../../../utilities/Math.utils";
import { MenuItemElement } from "./Menu.interfaces";
import StorybookMenuItem, { StorybookMenuItemProps } from "./MenuItem";
import { NestedMenuItem, NestedMenuItemProps } from "./NestedMenuItem";

interface StorybookMenuProps {
    children: MenuItemElement;
    button?: JSX.Element;
}

export default function StorybookMenu({
    children,
    button,
}: StorybookMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleButtonClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEl(e.currentTarget);
        setIsMenuOpen(!isMenuOpen);
    };

    const cloneMenuChildren = (children: MenuItemElement) => {
        let childrenArray = [];

        if (!Array.isArray(children)) {
            childrenArray.push(children);
        } else {
            childrenArray = children;
        }

        let clonedChildren: ReactElement[] = [];

        for (const child of childrenArray) {
            if (
                React.isValidElement<StorybookMenuItemProps>(child) &&
                child.type === StorybookMenuItem
            ) {
                clonedChildren = [
                    ...clonedChildren,
                    React.cloneElement<MenuItemProps>(child, {
                        key: generateRandomId(),
                        onClick: (e) => {
                            if (!child.props.disableCloseMenuOnClick) {
                                setAnchorEl(null);
                                alert(child.props.label);
                            }
                            child.props.onClick?.(e);
                        },
                    }),
                ];
            } else if (
                React.isValidElement<NestedMenuItemProps>(child) &&
                child.type === NestedMenuItem
            ) {
                let nestedMenuItemChildren: ReactElement<
                    MenuItemProps | DividerProps | ReactFragment
                >[] = [];

                if (Array.isArray(child.props?.children)) {
                    nestedMenuItemChildren = child.props?.children;
                } else if (child.props?.children) {
                    nestedMenuItemChildren.push(child.props.children);
                }
                const clonedNestedMenuChildren = cloneMenuChildren(
                    nestedMenuItemChildren
                );

                clonedChildren = [
                    ...clonedChildren,
                    React.cloneElement<NestedMenuItemProps>(child, {
                        key: generateRandomId(),
                        children: clonedNestedMenuChildren,
                        isParentMenuOpen: Boolean(anchorEl),
                    }),
                ];
            } else if (
                React.isValidElement<ReactFragment>(child) &&
                child.type === Fragment
            ) {
                const fragmentElement: ReactElement = child;
                const clonedFragmentChildren = cloneMenuChildren(
                    fragmentElement.props.children
                );
                clonedChildren = [...clonedChildren, ...clonedFragmentChildren];
            } else if (
                React.isValidElement<DividerProps>(child) &&
                child.type === Divider
            ) {
                clonedChildren.push(child);
            } else {
                console.error(
                    "StorybookMenu only supports children of type <StorybookMenuItem />, <NestedMenuItem />, <Divider /> or ReactFragment." +
                        " Try wrapping your element with a <StorybookMenuItem />"
                );
                clonedChildren.push(child);
            }
        }

        return clonedChildren;
    };

    return (
        <div>
            {button ? (
                React.cloneElement(button, {
                    onClick: handleButtonClick,
                })
            ) : (
                <button className="story__button" onClick={handleButtonClick}>
                    Open menu
                </button>
            )}
            <Menu
                anchorEl={anchorEl}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                {cloneMenuChildren(children)}
            </Menu>
        </div>
    );
}

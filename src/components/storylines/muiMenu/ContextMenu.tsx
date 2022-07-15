import { Divider, DividerProps, Menu, MenuItemProps } from "@mui/material";
import React, { Fragment, ReactFragment, useEffect } from "react";
import { ReactElement } from "react";
import { MenuItemElement } from "./Menu.interfaces";
import StorybookMenuItem, { StorybookMenuItemProps } from "./MenuItem";
import { NestedMenuItem, NestedMenuItemProps } from "./NestedMenuItem";

interface StorybookContextMenuProps {
    children: MenuItemElement;
    contextMenuDivRef: React.RefObject<HTMLDivElement>;
}

export default function StorybookContextMenu({
    children,
    contextMenuDivRef,
}: StorybookContextMenuProps) {
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setContextMenu(
                contextMenu === null
                    ? {
                          mouseX: e.clientX + 2,
                          mouseY: e.clientY - 6,
                      }
                    : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                      // Other native context menus might behave different.
                      // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                      null
            );
        };

        contextMenuDivRef?.current?.addEventListener(
            "contextmenu",
            handleContextMenu
        );

        return () =>
            contextMenuDivRef?.current?.removeEventListener(
                "contextmenu",
                handleContextMenu
            );
    }, []);

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleContextMenu = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        e.preventDefault();
        if (
            e.target ===
            document.getElementsByClassName(
                "MuiBackdrop-root MuiBackdrop-invisible css-g3hgs1-MuiBackdrop-root-MuiModal-backdrop"
            )[0]
        ) {
            setContextMenu(null);
        }
    };

    const generateRandomId = () => {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
        return (
            s4() +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            s4() +
            s4()
        );
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
                                setContextMenu(null);
                                alert(child.props.label);
                            }
                            child.props.onClick?.(e);
                        },
                        tabIndex: -1,
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
                        isParentMenuOpen: !!contextMenu,
                    }),
                ];
            } else if (child.type === Fragment) {
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
                    "StorybookMenu only supports children of type <StorybookMenuItem />, <NestedMenuItem />, <Divider /> or ReactFragment. Try wrapping your element with a <StorybookMenuItem />"
                );
                clonedChildren.push(child);
            }
        }

        return clonedChildren;
    };

    return (
        <div>
            <Menu
                anchorPosition={
                    contextMenu !== null
                        ? {
                              top: contextMenu.mouseY,
                              left: contextMenu.mouseX,
                          }
                        : undefined
                }
                anchorReference="anchorPosition"
                open={contextMenu !== null}
                onClose={handleClose}
                onContextMenu={handleContextMenu}
            >
                {cloneMenuChildren(children)}
            </Menu>
        </div>
    );
}

import { Divider, DividerProps, Menu, MenuItemProps } from "@mui/material";
import React, { Attributes, Fragment, ReactFragment } from "react";
import { ReactElement, useState } from "react";
import StorybookMenuItem, { StorybookMenuItemProps } from "./MenuItem";
import { NestedMenuItem, NestedMenuItemProps } from "./NestedMenuItem";

interface StorybookMenuProps {
    children: ReactElement<MenuItemProps | DividerProps | ReactFragment>[];
}

export default function StorybookMenu({ children }: StorybookMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleCloseMenu = () => {
        setAnchorEl(null);
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

    function cloneChild<T>(
        child: ReactElement<T>,
        props?: Partial<T> & Attributes
    ): ReactElement<T> {
        return React.cloneElement(child, props);
    }

    const cloneMenuChildren = (
        children: ReactElement<MenuItemProps | DividerProps | ReactFragment>[]
    ) => {
        let clonedChildren: ReactElement[] = [];

        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            if (
                React.isValidElement<StorybookMenuItemProps>(child) &&
                child.type === StorybookMenuItem
            ) {
                clonedChildren = [
                    ...clonedChildren,
                    cloneChild<MenuItemProps>(child, {
                        key: generateRandomId(),
                        onClick: (e) => {
                            !child.props.disableCloseMenuOnClick &&
                                setAnchorEl(null);
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
                    cloneChild<NestedMenuItemProps>(child, {
                        key: generateRandomId(),
                        children: clonedNestedMenuChildren,
                        isParentMenuOpen: Boolean(anchorEl),
                    }),
                ];
            } else if (child.type === Fragment || child.type === "div") {
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
                    "StorybookMenu only supports children of type <StorybookMenuItem />, <NestedMenuItem />, <Divider />, <div> or ReactFragment. Try wraping your element with a <StorybookMenuItem />"
                );
                clonedChildren.push(child);
            }
        }

        return clonedChildren;
    };

    return (
        <div>
            <button
                className="story__button"
                onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setIsMenuOpen(!isMenuOpen);
                }}
            >
                Open menu
            </button>
            <Menu
                anchorEl={anchorEl}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                {/* {React.Children.map(children, (child) => {
                    if (child.type === MenuItem) {
                        return React.cloneElement(child, {
                            onClick: () => setAnchorEl(null),
                        });
                    } else if (
                        child.type === React.Fragment ||
                        child.type === "div"
                    ) {
                        const fragmentElement: ReactElement = child;
                        return fragmentElement.props.children.map(
                            (child: ReactElement<MenuItemProps>) => {
                                return React.cloneElement(child, {
                                    onClick: () => setAnchorEl(null),
                                });
                            }
                        );
                    } else {
                        return child;
                    }
                })} */}
                {cloneMenuChildren(children)}
            </Menu>
        </div>
    );
}

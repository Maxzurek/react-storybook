import {
    Divider,
    DividerProps,
    Menu,
    MenuItem,
    MenuItemProps,
} from "@mui/material";
import React, { Attributes, Fragment, ReactFragment } from "react";
import { ReactElement, useState } from "react";

interface IteratorProps {
    children: ReactElement<MenuItemProps | DividerProps | ReactFragment>[];
}

export default function StorybookMenu({ children }: IteratorProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    function cloneChild<T>(
        child: ReactElement<T>,
        props?: Partial<T> & Attributes
    ): ReactElement<T> {
        return React.cloneElement(child, props);
    }

    const cloneChildren = (
        children: ReactElement<MenuItemProps | DividerProps | ReactFragment>[]
    ) => {
        let clonedChildren: ReactElement<MenuItemProps | DividerProps>[] = [];

        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            if (
                React.isValidElement<MenuItemProps>(child) &&
                child.type === MenuItem
            ) {
                console.log(child.props.children);
                clonedChildren = [
                    ...clonedChildren,
                    cloneChild<MenuItemProps>(child, {
                        key: `menu-item-${child.props.children}-${index}`,
                        onClick: () => setAnchorEl(null),
                    }),
                ];
            } else if (child.type === Fragment || child.type === "div") {
                const fragmentElement: ReactElement = child;
                const clonedFragmentChildren = cloneChildren(
                    fragmentElement.props.children
                );
                clonedChildren = [...clonedChildren, ...clonedFragmentChildren];
            } else if (
                React.isValidElement<DividerProps>(child) &&
                child.type === Divider
            ) {
                clonedChildren.push(child);
            } else {
                throw Error(
                    `StorybookMenu does not support children of type ${child.type}`
                );
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
                {cloneChildren(children)}
            </Menu>
        </div>
    );
}

import React, { useState, useRef, useImperativeHandle, useMemo } from "react";
import { ButtonBaseActions } from "@mui/material";
import { ArrowRight } from "@mui/icons-material";
import StorybookMenuItem, { StorybookMenuItemProps } from "./MenuItem";
import StorybookMenu, { StorybookMenuProps } from "./Menu";
import { MenuItemElement } from "./Menu.interfaces";

export interface NestedMenuItemProps extends Omit<StorybookMenuItemProps, "button"> {
    children?: MenuItemElement;
    /**
     * @default <ArrowRight />
     */
    rightIcon?: React.ReactNode;
    /**
     * Get Mui ButtonBaseActions ref map. ButtonBaseActions are used to focus menu items.
     */
    getActionsMap?: () => Map<string, ButtonBaseActions>;
    /**
     * Props passed to sub `<StorybookMenu />` element
     */
    menuProps?: Omit<StorybookMenuProps, "children">;
}

const NestedMenuItem = React.forwardRef<HTMLLIElement, NestedMenuItemProps>(
    (
        { children, rightIcon, getActionsMap, menuProps, ...menuItemProps }: NestedMenuItemProps,
        ref
    ) => {
        const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

        const menuItemRef = useRef<HTMLLIElement>();
        const menuContainerRef = useRef<HTMLDivElement>();

        useImperativeHandle(ref, () => menuItemRef.current as HTMLLIElement);

        const childrenArrayMemo = useMemo(() => {
            let childrenArray = [];

            if (!Array.isArray(children)) {
                childrenArray.push(children);
            } else {
                childrenArray = children;
            }
            return childrenArray;
        }, [children]);

        const handleMenuItemMouseEnter = () => {
            setIsSubMenuOpen(true);
        };

        const handleMenuItemMouseLeave = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            if (e.relatedTarget === menuContainerRef.current?.children?.[0]) return; // Mouse has entered our sub menu

            setIsSubMenuOpen(false);
        };

        const handleMenuItemFocus = () => {
            setIsSubMenuOpen(true);
        };

        const handleMenuItemBlur = (e: React.FocusEvent<HTMLLIElement, Element>) => {
            if (childrenArrayMemo.some((child) => child.props.id === e.relatedTarget?.id)) return; // We are focusing our sub menu

            setIsSubMenuOpen(false);
        };

        const handleMenuKeyDown = (e: React.KeyboardEvent) => {
            e.stopPropagation();

            if (e.key === "ArrowLeft") {
                getActionsMap().get(menuItemProps.id).focusVisible();
            }
        };

        const handleMenuItemKeyDown = (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    return;
                case "ArrowRight":
                    if (!childrenArrayMemo?.length) return;
                    getActionsMap().get(childrenArrayMemo[0].props.id)?.focusVisible();
                    break;
                default:
                    break;
            }
        };

        return (
            <>
                <StorybookMenuItem
                    {...menuItemProps}
                    ref={menuItemRef}
                    disableTouchRipple
                    icon={rightIcon ? rightIcon : <ArrowRight />}
                    onBlur={handleMenuItemBlur}
                    onFocus={handleMenuItemFocus}
                    onKeyDown={handleMenuItemKeyDown}
                    onMouseEnter={handleMenuItemMouseEnter}
                    onMouseLeave={handleMenuItemMouseLeave}
                />
                <StorybookMenu
                    {...menuProps}
                    anchorEl={isSubMenuOpen && menuItemRef.current}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    disableAutoFocus
                    disableEnforceFocus
                    PaperProps={{
                        onMouseLeave: handleMenuItemMouseLeave,
                    }}
                    // Set pointer events to 'none' to prevent the invisible Popover div
                    // from capturing events for clicks and hovers
                    style={{ pointerEvents: "none" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    onKeyDown={handleMenuKeyDown}
                >
                    <div
                        ref={menuContainerRef}
                        aria-disabled="true" // Prevents MUI from focusing our div when navigating with the keyboard arrows
                        style={{ pointerEvents: "auto" }}
                        tabIndex={-1}
                    >
                        {children}
                    </div>
                </StorybookMenu>
            </>
        );
    }
);

NestedMenuItem.displayName = "NestedMenuItem";
export { NestedMenuItem };

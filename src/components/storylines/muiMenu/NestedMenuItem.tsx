import React, {
    useState,
    useRef,
    useImperativeHandle,
    ReactElement,
} from "react";
import { DividerProps, Menu, MenuItemProps, MenuProps } from "@mui/material";
import { ArrowRight } from "@mui/icons-material";
import StorybookMenuItem from "./MenuItem";

export interface NestedMenuItemProps extends Omit<MenuItemProps, "button"> {
    children?:
        | ReactElement<MenuItemProps | NestedMenuItemProps | DividerProps>[]
        | ReactElement<MenuItemProps | NestedMenuItemProps | DividerProps>;
    label?: string;
    /**
     * Open state of parent `<Menu />`, used to close descendant menus when the
     * root menu is closed.
     */
    isParentMenuOpen?: boolean;
    /**
     * @default <ArrowRight />
     */
    rightIcon?: React.ReactNode;
    /**
     * Props passed to container element.
     */
    containerProps?: React.HTMLAttributes<HTMLElement> &
        React.RefAttributes<HTMLElement>;
    /**
     * Props passed to sub `<Menu/>` element
     */
    MenuProps?: Omit<MenuProps, "children">;
}

const NestedMenuItem = React.forwardRef<HTMLLIElement, NestedMenuItemProps>(
    function NestedMenuItem(
        {
            children,
            label,
            isParentMenuOpen,
            rightIcon,
            containerProps = {},
            MenuProps,
            ...menuItemProps
        }: NestedMenuItemProps,
        ref
    ) {
        const { ref: containerRefProp, ...ContainerProps } = containerProps;

        const menuItemRef = useRef<HTMLLIElement>(null);
        useImperativeHandle(ref, () => menuItemRef.current as HTMLLIElement);

        const containerRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(
            containerRefProp,
            () => containerRef.current as HTMLDivElement
        );

        const menuContainerRef = useRef<HTMLDivElement>(null);

        const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

        const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
            setIsSubMenuOpen(true);

            if (ContainerProps.onMouseEnter) {
                ContainerProps.onMouseEnter(e);
            }
        };
        const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
            setIsSubMenuOpen(false);

            if (ContainerProps.onMouseLeave) {
                ContainerProps.onMouseLeave(e);
            }
        };

        // Check if any immediate children are active
        const isSubmenuFocused = () => {
            const active = containerRef.current?.ownerDocument?.activeElement;
            for (const child of Array.from(
                menuContainerRef.current?.children ?? []
            )) {
                if (child === active) {
                    return true;
                }
            }
            return false;
        };

        const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
            if (e.target === containerRef.current) {
                setIsSubMenuOpen(true);
            }

            if (ContainerProps.onFocus) {
                ContainerProps.onFocus(e);
            }

            menuItemRef.current?.focus();
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
                return;
            }

            if (isSubmenuFocused()) {
                e.stopPropagation();
            }

            const active = containerRef.current?.ownerDocument.activeElement;

            if (e.key === "ArrowLeft" && isSubmenuFocused()) {
                containerRef.current?.focus();
            }

            if (e.key === "ArrowRight" && e.target === active) {
                const firstChild = menuContainerRef.current
                    ?.children[0] as HTMLLIElement;
                firstChild?.focus();
            }
        };

        const open = isSubMenuOpen && Boolean(isParentMenuOpen);

        return (
            <div
                {...ContainerProps}
                ref={containerRef}
                tabIndex={-1}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <StorybookMenuItem
                    {...menuItemProps}
                    ref={menuItemRef}
                    icon={rightIcon ? rightIcon : <ArrowRight />}
                    label={label}
                />
                <Menu
                    // Set pointer events to 'none' to prevent the invisible Popover div
                    // from capturing events for clicks and hovers
                    {...MenuProps}
                    anchorEl={menuItemRef.current}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    autoFocus={false}
                    disableAutoFocus
                    disableEnforceFocus
                    open={open}
                    style={{ pointerEvents: "none" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    onClose={() => {
                        setIsSubMenuOpen(false);
                    }}
                >
                    <div
                        ref={menuContainerRef}
                        style={{ pointerEvents: "auto" }}
                    >
                        {children}
                    </div>
                </Menu>
            </div>
        );
    }
);

NestedMenuItem.displayName = "NestedMenuItem";
export { NestedMenuItem };

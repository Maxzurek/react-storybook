import "./DropdownMenu.scss";

import { getScrollBarWidth, withClassNames } from "../../utilities/Html.utils";
import { ReactNode, forwardRef, useEffect, useRef, useState } from "react";
import { handleForwardRef } from "../../utilities/React.utils";

export enum DropdownMenuPosition {
    Top,
    Bottom,
}

interface DropdownMenuProps {
    isOpen: boolean;
    anchorElement: HTMLElement;
    children: ReactNode;
    className?: string;
    /**
     * In milliseconds
     *
     * @default 250
     */
    animationDuration?: number;
    /**
     * @default "primary"
     */
    theme?: "primary" | "secondary" | "accent";
    /**
     * @default "light"
     */
    backgroundTheme?: "light" | "dark";
    maxHeight?: number;
    /**
     * @default "fit-content"
     */
    calculateWith?: "fit-content" | "anchor-width";
    /**
     * @default "top-left"
     */
    anchorOrigin?: "top-left" | "top-right";
    /**
     * If true, the menu will not automatically re-anchor if it overflows when opened
     */
    isReAnchorOnOverflowDisabled?: boolean;
    onAfterOpen?: (position: DropdownMenuPosition) => void;
}

const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
    (
        {
            isOpen,
            anchorElement,
            children,
            className,
            animationDuration = 250,
            theme = "primary",
            backgroundTheme = "light",
            maxHeight,
            calculateWith = "fit-content",
            anchorOrigin = "top-left",
            isReAnchorOnOverflowDisabled,
            onAfterOpen,
        },
        ref
    ) => {
        const [position, setPosition] = useState(DropdownMenuPosition.Bottom);

        const dropdownMenuRef = useRef<HTMLDivElement>();

        useEffect(() => {
            if (!isOpen) {
                document.body.style.paddingRight = "";
                document.body.style.overflow = "";
            }

            // Scroll top only when the menu opens
            if (isOpen && dropdownMenuRef.current) {
                dropdownMenuRef.current.scrollTop = 0;
            }
        }, [isOpen]);

        const handleCalculateMenuPosition = (dropdownMenuElement: HTMLDivElement) => {
            const anchorRect = anchorElement.getBoundingClientRect();
            const dropdownMenuRect = dropdownMenuElement.getBoundingClientRect();
            const menuWidth =
                calculateWith === "anchor-width" ? anchorRect.width : dropdownMenuRect.width;
            const menuHeight = dropdownMenuElement.clientHeight;
            let position = DropdownMenuPosition.Bottom;
            let menuTop: number;
            let menuLeft: number;

            switch (anchorOrigin) {
                case "top-left":
                    menuTop = anchorRect.bottom;
                    menuLeft = anchorRect.left;
                    break;
                case "top-right":
                    menuTop = anchorRect.bottom;
                    menuLeft = anchorRect.right - menuWidth;
                    break;
            }

            const menuRight = menuLeft + menuWidth;
            const menuBottom = menuTop + menuHeight;
            const isMenuBottomOverflowing = menuBottom > window.innerHeight;
            const isMenuLeftOverflowing = menuLeft < 0;
            const isMenuRightOverflowing = menuRight > window.innerWidth;

            if (!isReAnchorOnOverflowDisabled) {
                if (isMenuBottomOverflowing) {
                    menuTop = menuTop - anchorRect.height - menuHeight;
                    position = DropdownMenuPosition.Top;
                }
                if (isMenuLeftOverflowing) {
                    menuLeft = 0;
                }
                if (isMenuRightOverflowing) {
                    menuLeft = window.innerWidth - dropdownMenuRect.width;
                }
            }

            dropdownMenuElement.style.setProperty("--dropdown-menu-top", `${menuTop.toString()}px`);
            dropdownMenuElement.style.setProperty(
                "--dropdown-menu-left",
                `${menuLeft.toString()}px`
            );

            setPosition(position);

            return position;
        };

        const handleCalculateMenuWidth = (dropDrownMenuElement: HTMLDivElement) => {
            const { width } = anchorElement.getBoundingClientRect();

            dropDrownMenuElement.style.setProperty(
                "--dropdown-menu-width",
                calculateWith === "anchor-width" ? `${width}px` : "fit-content"
            );
        };

        const handleRefCallback = (node: HTMLDivElement) => {
            dropdownMenuRef.current = node;
            handleForwardRef(node, ref);

            if (!node || !anchorElement || !isOpen) return;

            node.style.setProperty(
                "--dropdown-menu-animation-duration",
                `${animationDuration / 1000}s`
            );
            node.style.setProperty(
                "--dropdown-menu-max-height",
                maxHeight ? `${maxHeight}px` : "230px"
            );

            const isBodyOverflowing = window.innerHeight < document.body.clientHeight;
            const isTouchDevice = "ontouchstart" in window;
            if (isBodyOverflowing) {
                document.body.style.overflow = "hidden";
            }
            if (isBodyOverflowing && !isTouchDevice) {
                const scrollbarWidth = getScrollBarWidth();
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            const position = handleCalculateMenuPosition(node);
            handleCalculateMenuWidth(node);

            onAfterOpen?.(position);
        };

        return (
            <div
                ref={handleRefCallback}
                className={withClassNames([
                    className,
                    "dropdown-menu",
                    isOpen ? "dropdown-menu--opened" : "dropdown-menu--closed",
                    position === DropdownMenuPosition.Bottom && "dropdown-menu--position-bottom",
                    position === DropdownMenuPosition.Top && "dropdown-menu--position-top",
                    theme === "secondary" && "dropdown-menu--secondary",
                    theme === "accent" && "dropdown-menu--accent",
                    backgroundTheme === "dark" && "dropdown-menu--bg-dark",
                ])}
            >
                {children}
            </div>
        );
    }
);

DropdownMenu.displayName = "DropdownMenu";
export default DropdownMenu;

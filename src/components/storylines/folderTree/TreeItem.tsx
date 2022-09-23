import React, { forwardRef, useImperativeHandle, useRef } from "react";
import useRefCallback from "../../../hooks/useRefCallback";
import useScrollUntilVisible from "../../../hooks/useScrollUntilVisible";
import { FolderTreeItem, FolderTreeSize } from "./TreeItem.interfaces";

import "./TreeItem.scss";

export interface TreeItemRef {
    innerRef: HTMLDivElement;
    focus: (options?: FocusOptions) => void;
    focusAndSelectInput: (options?: FocusOptions) => void;
    scrollIntoView: (scrollArgs?: ScrollIntoViewOptions) => void;
}

export interface TreeItemProps {
    treeItem: FolderTreeItem;
    /**
     * Highlight the depth line with the corresponding depth number.
     */
    depthNumberToHighlight?: number;
    /**
     * If true the item background will be highlighted.
     * Default background color: blue.
     */
    isSelected?: boolean;
    /**
     * If true the item border be highlighted.
     * Default border color: blue.
     */
    isFocused?: boolean;
    /**
     * If disabled, the item won't be selectable nor editable.
     * The label will also be greyed out.
     */
    isDisabled?: boolean;
    /**
     * If true, the label will be replaced by an input.
     */
    isInEditMode?: boolean;
    /**
     * The value of the input when the TreeItem is in edit mode.
     */
    inEditModeInputValue?: string;
    /**
     * The icon will be displayed on the right of the leftAdornment and on the left of the label.
     */
    icon?: JSX.Element;
    /**
     * The caretIcon will be displayed on the right of the depth line and on the left of the icon.
     */
    caretIcon?: JSX.Element;
    /**
     * The rightAdornment will be displayed on the right of the label. It's position is absolute, on the right hand side of the TreeItem.
     */
    rightAdornment?: JSX.Element;
    /**
     * The size of the component (small | medium | large). @default small
     */
    size?: FolderTreeSize;
    /**
     * If set to true, the depth lines that are not highlighted will always be visible.
     */
    showInactiveDepthLines?: boolean;
    onClick?: (treeItem: FolderTreeItem) => void;
    onInputBlur?: (
        treeItem: FolderTreeItem,
        e: React.FocusEvent<HTMLInputElement, Element>
    ) => void;
    onInputKeydown?: (treeItem: FolderTreeItem, e: React.KeyboardEvent<HTMLInputElement>) => void;
    onInputValueChange?: (treeItem: FolderTreeItem, value: string) => void;
    onContextMenu?: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        treeItem: FolderTreeItem
    ) => void;
}

const TreeItem = forwardRef<TreeItemRef, TreeItemProps>(
    (
        {
            treeItem,
            depthNumberToHighlight,
            isSelected,
            isFocused,
            isDisabled,
            isInEditMode,
            inEditModeInputValue,
            icon,
            caretIcon,
            rightAdornment,
            showInactiveDepthLines,
            size = "small",
            onClick,
            onInputBlur,
            onInputKeydown,
            onInputValueChange,
            onContextMenu,
        }: TreeItemProps,
        ref
    ) => {
        const { scrollElementIntoView } = useScrollUntilVisible();
        const {
            setRefCallback: setInputRefCallback,
            setOnNodeAttachedHandler: setOnInputNodeAttachedHandler,
        } = useRefCallback<HTMLInputElement>();

        const treeItemDivRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            innerRef: treeItemDivRef.current,
            focus: handleFocus,
            focusAndSelectInput: handleFocusAndSelectInput,
            scrollIntoView: handleScrollIntoView,
        }));

        const handleItemClick = () => {
            if (isDisabled || isInEditMode) return;

            onClick?.(treeItem);
        };

        const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;

            onInputValueChange?.(treeItem, newValue);
        };

        const handleInputKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            onInputKeydown(treeItem, e);
        };

        const handleInputBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
            onInputBlur(treeItem, e);
        };

        const handleFocusAndSelectInput = (options?: FocusOptions) => {
            setOnInputNodeAttachedHandler(treeItem.id, (node) => {
                setTimeout(() => {
                    node.focus(options);
                    node.select();
                });
            });
        };

        const handleFocus = (options?: FocusOptions) => {
            treeItemDivRef.current?.focus(options);
        };

        const handleScrollIntoView = (scrollArgs?: ScrollIntoViewOptions) => {
            scrollElementIntoView(treeItemDivRef.current, {
                scrollArgs,
            });
        };

        const renderDepthLines = () => {
            return Array.from(Array(treeItem.depth).keys()).map((depthValue, index) => {
                const isDepthLineHighlighted = index === depthNumberToHighlight;

                const depthLineClassNames = ["tree-item__depth-line"];
                isDepthLineHighlighted &&
                    depthLineClassNames.push("tree-item__depth-line--highlighted");
                !showInactiveDepthLines &&
                    !isDepthLineHighlighted &&
                    depthLineClassNames.push("tree-item__depth-line--hidden");

                return (
                    <div
                        key={`tree-item-line-depth-${depthValue}-${treeItem.id}`}
                        className="tree-item__depth-line-container"
                    >
                        <div className={depthLineClassNames.join(" ")} />
                    </div>
                );
            });
        };

        const treeItemClassNames = ["tree-item"];
        isSelected &&
            !isDisabled &&
            !isInEditMode &&
            treeItemClassNames.push("tree-item--selected");
        isFocused && !isDisabled && !isInEditMode && treeItemClassNames.push("tree-item--focused");
        isDisabled && treeItemClassNames.push("tree-item--disabled");
        isInEditMode && treeItemClassNames.push("tree-item--active");
        treeItemClassNames.push(`tree-item--${size}`);

        const labelClassNames = ["tree-item__label"];
        isDisabled && labelClassNames.push("tree-item__label--disabled");

        return (
            <div
                ref={treeItemDivRef}
                className={treeItemClassNames.join(" ")}
                tabIndex={0}
                onClick={handleItemClick}
                onContextMenu={(e) => onContextMenu?.(e, treeItem)}
            >
                {renderDepthLines()}
                {caretIcon ? (
                    <div className="tree-item__caret-icon">{caretIcon}</div>
                ) : (
                    <div className="tree-item__caret-icon--empty" /> // We want to keep the same spacing even if leftAdornment is not provided
                )}
                {icon && <div className="tree-item__icon">{icon}</div>}
                {!isDisabled && isInEditMode ? (
                    <input
                        ref={(node) => setInputRefCallback(treeItem.id, node)}
                        autoFocus
                        className="tree-item__input"
                        name="test"
                        value={inEditModeInputValue}
                        onBlur={handleInputBlur}
                        onChange={handleInputValueChange}
                        onKeyDown={handleInputKeydown}
                    />
                ) : (
                    <span className={labelClassNames.join(" ")}>{treeItem.label}</span>
                )}
                {rightAdornment && (
                    <div className="tree-item__right-adornment">
                        {!isInEditMode && rightAdornment}
                    </div>
                )}
            </div>
        );
    }
);

TreeItem.displayName = "TreeItem";
export default TreeItem;

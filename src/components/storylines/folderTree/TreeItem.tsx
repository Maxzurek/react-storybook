import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { flushSync } from "react-dom";
import useRefCallback from "../../../hooks/useRefCallback";
import useScrollUntilVisible from "../../../hooks/useScrollUntilVisible";
import { FolderTreeItem, FolderTreeSize } from "./TreeItem.interfaces";

import "./TreeItem.scss";

export interface TreeItemRef {
    innerRef: HTMLDivElement;
    setInEditMode: () => void;
    stopEditMode: () => void;
    cancelEditMode: () => void;
    focus: (options?: FocusOptions) => void;
    scrollIntoView: (scrollArgs?: ScrollIntoViewOptions) => void;
    scrollIntoViewAndEdit: (scrollArgs?: ScrollIntoViewOptions) => void;
}

export interface TreeItemProps {
    treeItem: FolderTreeItem;
    /**
     * Highlight the branch line with the corresponding depth.
     */
    branchLineDepthToHighlight?: number;
    /**
     * If set to true, the branch lines that are not highlighted will always be visible.
     */
    showInactiveBranchLines?: boolean;
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
    onClick?: (treeItem: FolderTreeItem) => void;
    onEditEnd?: (treeItem: FolderTreeItem) => void;
    onContextMenu?: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        treeItem: FolderTreeItem
    ) => void;
}

const TreeItem = forwardRef<TreeItemRef, TreeItemProps>(
    (
        {
            treeItem,
            branchLineDepthToHighlight,
            showInactiveBranchLines,
            isSelected,
            isFocused,
            isDisabled,
            icon,
            caretIcon,
            rightAdornment,
            size = "small",
            onClick,
            onEditEnd,
            onContextMenu,
        }: TreeItemProps,
        ref
    ) => {
        const { scrollElementIntoView } = useScrollUntilVisible();
        const {
            setRefCallback: setInputRefCallback,
            setNodeActionCallback: setInputNodeActionCallback,
        } = useRefCallback<HTMLInputElement>();

        const [isInEditMode, setIsInEditMode] = useState(false);
        const [inputValue, setInputValue] = useState("");
        const [wasEditModeCanceledOrStoppedByKeydown, setWasEditModeCanceledOrStoppedByKeydown] =
            useState(false);

        // const inputRef = useRef<HTMLInputElement>(null);
        const treeItemDivRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            innerRef: treeItemDivRef.current,
            setInEditMode: handleSetInEditMode,
            stopEditMode: handleStopEditMode,
            cancelEditMode: handleCancelEditMode,
            focus: handleFocus,
            scrollIntoView: handleScrollIntoView,
            scrollIntoViewAndEdit: handleScrollIntoViewAndEdit,
        }));

        const handleSetInEditMode = () => {
            if (isInEditMode) return;

            setIsInEditMode(true);
            setWasEditModeCanceledOrStoppedByKeydown(false);
            setInputValue(treeItem.label ?? "");
            setInputNodeActionCallback(treeItem.id, (node) => {
                node.focus({ preventScroll: true });
                node.select();
            });
        };

        const handleCancelEditMode = () => {
            if (!isInEditMode) return;

            setIsInEditMode(false);
            onEditEnd?.(treeItem);
        };

        const handleStopEditMode = () => {
            if (!isInEditMode) return;

            setIsInEditMode(false);

            treeItem.label = inputValue;
            onEditEnd?.(treeItem);
        };

        const handleItemClick = () => {
            if (isDisabled || isInEditMode) return;

            onClick?.(treeItem);
        };

        const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
        };

        const handleInputKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            switch (e.key) {
                case "ArrowUp":
                case "ArrowDown":
                    e.stopPropagation();
                    break;
                case "Escape":
                case "Enter":
                    // Our input blur handler needs to have the wasEditModeCanceledOrStoppedByKeydown state synced
                    flushSync(() => {
                        setWasEditModeCanceledOrStoppedByKeydown(true);
                    });
                    break;
                default:
                    break;
            }
        };

        const handleInputBlur = () => {
            if (!isInEditMode || wasEditModeCanceledOrStoppedByKeydown) return;

            handleStopEditMode();
        };

        const handleFocus = (options?: FocusOptions) => {
            treeItemDivRef.current?.focus(options);
        };

        const handleScrollIntoView = (scrollArgs?: ScrollIntoViewOptions) => {
            scrollElementIntoView(treeItemDivRef.current, {
                scrollArgs,
                intersectionRatio: 0.9,
            });
        };

        const handleScrollIntoViewAndEdit = (scrollArgs?: ScrollIntoViewOptions) => {
            scrollElementIntoView(treeItemDivRef.current, {
                scrollArgs,
                intersectionRatio: 0.1,
            }).then(() => {
                handleSetInEditMode();
            });
        };

        const renderBranchLines = () => {
            return Array.from(Array(treeItem.depth).keys()).map((depthValue, index) => {
                const isBranchLineHighlighted = index === branchLineDepthToHighlight;

                const branchLineClassNames = ["tree-item__branch-line"];
                isBranchLineHighlighted &&
                    branchLineClassNames.push("tree-item__branch-line--highlighted");
                !showInactiveBranchLines &&
                    !isBranchLineHighlighted &&
                    branchLineClassNames.push("tree-item__branch-line--hidden");

                return (
                    <div
                        key={`tree-item-line-depth-${depthValue}-${treeItem.id}`}
                        className="tree-item__branch-line-container"
                    >
                        <div className={branchLineClassNames.join(" ")} />
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
                {renderBranchLines()}
                {caretIcon ? (
                    <div className="tree-item__caret-icon">{caretIcon}</div>
                ) : (
                    <div className="tree-item__caret-icon--empty" /> // We want to keep the same spacing even if leftAdornment is not provided
                )}
                {icon && <div className="tree-item__icon">{icon}</div>}
                {isInEditMode ? (
                    <input
                        ref={(node) => setInputRefCallback(treeItem.id, node)}
                        className="tree-item__input"
                        name="test"
                        value={inputValue}
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

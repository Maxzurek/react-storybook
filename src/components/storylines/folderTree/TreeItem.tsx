import React, { forwardRef, useImperativeHandle, useRef } from "react";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";
import useRefCallback from "../../../hooks/useRefCallback";
import useScrollWithIntersectionObserver from "../../../hooks/useScrollWithIntersectionObserver";
import { FolderTreeItem, FolderTreeSize } from "./TreeItem.interfaces";

import "./TreeItem.scss";

export interface TreeItemRef {
    innerRef: HTMLDivElement;
    focusContainer: (options?: FocusOptions) => void;
    focusInput: (options?: FocusOptions) => void;
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
     * The caretIconElement will be displayed tp the right of the depth line and to the left of the iconElement.
     */
    caretIconElement?: JSX.Element;
    /**
     * The iconElement will be displayed to the right of the caretIconElement.
     */
    iconElement?: JSX.Element;
    /**
     * The labelElement will be displayed to the left of the iconElement.
     */
    labelElement?: JSX.Element;
    /**
     * The leftAdornmentElement's position is absolute, on the left hand side of the TreeItem.
     */
    leftAdornmentElement?: JSX.Element;
    /**
     * The rightAdornmentElement's position is absolute, on the right hand side of the TreeItem.
     */
    rightAdornmentElement?: JSX.Element;
    /**
     * The bodyElement will be displayed bellow the: caretIconElement, iconElement, labelElement, leftAdornmentElement, rightAdornmentElement
     */
    bodyElement?: JSX.Element;
    /**
     * The size of the component (small | medium | large).
     * @default small
     */
    size?: FolderTreeSize;
    /**
     * If set to true, the depth lines that are not highlighted will always be visible.
     */
    showInactiveDepthLines?: boolean;
    /**
     * If set to true, all the depth lines will be hidden.
     */
    hideDepthLines?: boolean;
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
            caretIconElement,
            iconElement,
            labelElement,
            leftAdornmentElement,
            rightAdornmentElement,
            bodyElement,
            size = "small",
            showInactiveDepthLines,
            hideDepthLines,
            onClick,
            onInputBlur,
            onInputKeydown,
            onInputValueChange,
            onContextMenu,
        }: TreeItemProps,
        ref
    ) => {
        const { scrollToUntilVisible } = useScrollWithIntersectionObserver();
        const { setRefCallback: setInputRefCallback, onNodeAttached } =
            useRefCallback<HTMLInputElement>();
        const { onNodeIntersecting } = useIntersectionObserver<HTMLInputElement>();

        const treeItemDivRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            innerRef: treeItemDivRef.current,
            focusContainer: handleFocusContainer,
            focusInput: handleFocusInput,
            focusAndSelectInput: handleFocusAndSelectInput,
            scrollIntoView: handleScrollIntoView,
        }));

        const handleItemClick = () => {
            if (isDisabled || (isInEditMode && !labelElement)) return;

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
            onNodeAttached(treeItem.id, (node) => {
                onNodeIntersecting(node, (node) => {
                    node.focus(options);
                    node.select();
                });
            });
        };

        const handleFocusContainer = (options?: FocusOptions) => {
            treeItemDivRef.current?.focus(options);
        };

        const handleFocusInput = (options?: FocusOptions) => {
            onNodeAttached(treeItem.id, (node) =>
                onNodeIntersecting(node, (node) => {
                    node.focus(options);
                })
            );
        };

        const handleScrollIntoView = (scrollArgs?: ScrollIntoViewOptions) => {
            scrollToUntilVisible(treeItemDivRef.current, {
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
                        {!hideDepthLines && <div className={depthLineClassNames.join(" ")} />}
                    </div>
                );
            });
        };

        const treeItemClassNames = ["tree-item"];
        treeItemClassNames.push(`tree-item--${size}`);
        !isDisabled &&
            (!isInEditMode || labelElement) &&
            isSelected &&
            treeItemClassNames.push("tree-item--selected");
        !isDisabled &&
            (!isInEditMode || labelElement) &&
            isFocused &&
            treeItemClassNames.push("tree-item--focused");
        isDisabled && treeItemClassNames.push("tree-item--disabled");
        !labelElement && isInEditMode && treeItemClassNames.push("tree-item--active");

        const labelClassNames = ["tree-item__label"];
        isDisabled && labelClassNames.push("tree-item__label--disabled");

        return (
            <>
                <div
                    ref={treeItemDivRef}
                    className={treeItemClassNames.join(" ")}
                    tabIndex={0}
                    onClick={handleItemClick}
                    onContextMenu={(e) => onContextMenu?.(e, treeItem)}
                >
                    <div className="tree-item__header">
                        {leftAdornmentElement && (
                            <div className="tree-item__left-adornment">{leftAdornmentElement}</div>
                        )}
                        {renderDepthLines()}
                        {caretIconElement ? (
                            <div className="tree-item__caret-icon">{caretIconElement}</div>
                        ) : (
                            <div className="tree-item__caret-icon--empty" /> // We want to keep the same spacing even if leftAdornment is not provided
                        )}
                        {iconElement && <div className="tree-item__icon">{iconElement}</div>}
                        {!isDisabled && !labelElement && isInEditMode && (
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
                        )}
                        {!labelElement && !isInEditMode && (
                            <span className={labelClassNames.join(" ")}>{treeItem.label}</span>
                        )}
                        {labelElement && (
                            <div className={labelClassNames.join(" ")}>{labelElement}</div>
                        )}
                        {rightAdornmentElement && (
                            <div className="tree-item__right-adornment">
                                {rightAdornmentElement}
                            </div>
                        )}
                    </div>
                    {bodyElement && (
                        <div className="tree-item__body">
                            <div className="tree-item__absolute-container">
                                {renderDepthLines()}
                            </div>
                            {bodyElement}
                        </div>
                    )}
                </div>
            </>
        );
    }
);

TreeItem.displayName = "TreeItem";
export default TreeItem;

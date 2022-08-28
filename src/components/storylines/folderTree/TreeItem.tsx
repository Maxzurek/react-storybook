import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import useScrollUntilVisible from "../../../hooks/useScrollUntilVisible";
import { ITreeItem } from "./TreeItem.interfaces";

import "./TreeItem.scss";

export interface ITreeItemRef {
    innerRef: HTMLDivElement;
    setFocusAndEdit: () => void;
    focus: (options?: FocusOptions) => void;
    scrollIntoView: () => void;
    scrollIntoViewAndEdit: () => void;
}

export interface TreeItemProps {
    id: string;
    /**
     * The icon will be displayed on the right of the icon and on the left of the rightAdornment.
     */
    label: string;
    /**
     * Will determine the depth of the item. Margin will be applied on the left of the line (even if it is hidden).
     * A value of 0 means the tree item is at the root of the folder tree.
     */
    depth: number;
    /**
     * Ids of all the ancestor's folders of the TreeITem.
     */
    ancestorFolderIds: string[];
    /**
     * The folder that is currently open and active.
     * This prop is used to highlight the branch line of this TreeItem if it's parent folder is open and selected
     */
    activeFolder?: ITreeItem;
    /**
     * If set to true, the branch lines that are not highlighted will be hidden. 🚨MAY REDUCE PERFORMANCE🚨
     */
    hideInactiveBranchLine?: boolean;
    /**
     * If true the item will be highlighted is grey.
     */
    isSelected?: boolean;
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
     * The leftAdornment will be displayed on the right of the depth line and on the left of the icon.
     */
    leftAdornment?: JSX.Element;
    /**
     * The rightAdornment will be displayed on the right of the label. It's position is absolute, on the right hand side of the TreeItem.
     */
    rightAdornment?: JSX.Element;
    onItemClick?: () => void;
    onLabelChanged?: (itemId: string, newValue: string) => void;
    onFirstEditEnded?: (itemId: string, labelValue: string) => void;
    onContextMenu?: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        treeItemId: string
    ) => void;
}

const TreeItem = forwardRef<ITreeItemRef, TreeItemProps>(
    (
        {
            id,
            label,
            depth,
            ancestorFolderIds,
            activeFolder,
            hideInactiveBranchLine,
            isSelected,
            isDisabled,
            icon,
            leftAdornment,
            rightAdornment,
            onItemClick,
            onLabelChanged,
            onFirstEditEnded,
            onContextMenu,
        }: TreeItemProps,
        ref
    ) => {
        const [isInEditMode, setIsInEditMode] = useState(false);
        const [inputValue, setInputValue] = useState("");
        const [isHighlighted, setIsHighlighted] = useState(false);

        const { scrollElementIntoView } = useScrollUntilVisible();

        const inputRef = useRef<HTMLInputElement>(null);
        const isFirstEdit = useRef(true);
        const treeItemDivRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            innerRef: treeItemDivRef.current,
            setFocusAndEdit: handleSetInEditMode,
            focus: handleFocus,
            scrollIntoView: handleScrollIntoView,
            scrollIntoViewAndEdit: handleScrollIntoViewAndEdit,
        }));

        const handleSetInEditMode = () => {
            // Render our input element before focusing it
            flushSync(() => {
                setIsHighlighted(false);
                setIsInEditMode(true);
                setInputValue(label);
            });
            inputRef.current?.focus();
            inputRef.current?.select();
        };

        const handleStopEditMode = () => {
            if (isSelected) {
                setIsHighlighted(true);
            }
            setIsInEditMode(false);

            if (!inputValue) return; // TODO Display an error if the input value is empty?

            if (inputValue !== label) {
                onLabelChanged?.(id, inputValue);
                scrollElementIntoView(treeItemDivRef.current, {
                    scrollArgs: { behavior: "smooth", block: "nearest" },
                }).then(() => {
                    handleFocus();
                });
            } else {
                handleFocus({ preventScroll: true });
            }
        };

        const handleItemClick = () => {
            if (!isDisabled) {
                setIsHighlighted(true);
                onItemClick?.();
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            e.stopPropagation();

            if (isDisabled) return;

            switch (e.key) {
                case "F2":
                    handleSetInEditMode();
                    break;
                default:
                    break;
            }
        };

        const handleInputValueChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            setInputValue(e.target.value);
        };

        const handleInputClick = (
            e: React.MouseEvent<HTMLInputElement, MouseEvent>
        ) => {
            e.stopPropagation();
        };

        const handleInputBlur = () => {
            if (isFirstEdit.current) {
                onFirstEditEnded?.(id, inputValue);
                isFirstEdit.current = false;
            } else if (!inputValue) {
                return; // TODO Display an error if the input value is empty?
            } else if (inputValue !== label) {
                onLabelChanged?.(id, inputValue);
            }
            setIsInEditMode(false);
        };

        const handleInputKeyDown = (
            e: React.KeyboardEvent<HTMLInputElement>
        ) => {
            e.stopPropagation();

            switch (e.key) {
                case "Enter":
                case "Escape":
                    isInEditMode && handleStopEditMode();
                    break;
                default:
                    break;
            }
        };

        const handleFocus = (options?: FocusOptions) => {
            treeItemDivRef.current?.focus(options);
        };

        const handleScrollIntoView = () => {
            scrollElementIntoView(treeItemDivRef.current, {
                scrollArgs: { behavior: "smooth" },
                intersectionRatio: 0.9,
            });
        };

        const handleScrollIntoViewAndEdit = () => {
            scrollElementIntoView(treeItemDivRef.current, {
                scrollArgs: { behavior: "smooth" },
                intersectionRatio: 0.9,
            }).then(() => {
                handleSetInEditMode();
            });
        };

        const renderBranchLines = () => {
            return Array.from(Array(depth).keys()).map((depthValue, index) => {
                const isDescendantOfActiveFolder = ancestorFolderIds?.some(
                    (id) => id === activeFolder?.id
                );
                const isBranchLineHighlighted =
                    isDescendantOfActiveFolder && index === activeFolder?.depth;

                const branchLineClassNames = ["tree-item__branch-line"];
                isBranchLineHighlighted &&
                    branchLineClassNames.push(
                        "tree-item__branch-line--highlighted"
                    );
                hideInactiveBranchLine &&
                    !isBranchLineHighlighted &&
                    branchLineClassNames.push("tree-item__branch-line--hidden");

                return (
                    <div
                        key={`tree-item-line-depth-${depthValue}-${id}`}
                        className="tree-item__branch-line-container"
                    >
                        <div className={branchLineClassNames.join(" ")} />
                    </div>
                );
            });
        };

        const treeItemClassNames = ["tree-item"];
        !isDisabled &&
            isSelected &&
            treeItemClassNames.push("tree-item--selected");
        isDisabled && treeItemClassNames.push("tree-item--disabled");
        isHighlighted &&
            isSelected &&
            treeItemClassNames.push("tree-item--highlighted");

        const labelClassNames = ["tree-item__label"];
        isDisabled && labelClassNames.push("tree-item__label--disabled");

        return (
            <div
                ref={treeItemDivRef}
                className={treeItemClassNames.join(" ")}
                tabIndex={0}
                onClick={handleItemClick}
                onContextMenu={(e) => onContextMenu?.(e, id)}
                onKeyDown={handleKeyDown}
            >
                <div className="tree-item__branch-line-container" />
                {renderBranchLines()}
                {leftAdornment && (
                    <div className="tree-item__left-adornment">
                        {leftAdornment}
                    </div>
                )}
                {icon && <div className="tree-item__icon">{icon}</div>}
                <span className={labelClassNames.join(" ")}>
                    {!isInEditMode && label ? (
                        label
                    ) : (
                        <input
                            ref={inputRef}
                            className="tree-item__input"
                            name="test"
                            value={inputValue}
                            onBlur={handleInputBlur}
                            onChange={handleInputValueChange}
                            onClick={handleInputClick}
                            onKeyDown={handleInputKeyDown}
                        />
                    )}
                </span>
                <div className="tree-item__right-adornment">
                    {rightAdornment && rightAdornment}
                </div>
            </div>
        );
    }
);

TreeItem.displayName = "TreeItem";
export default TreeItem;

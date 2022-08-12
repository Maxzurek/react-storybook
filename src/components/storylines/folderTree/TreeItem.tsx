import { ClickAwayListener } from "@mui/material";
import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import useManipulateDomWhenVisible from "../../../hooks/useManipulateDomWhenVisible";
import { ITreeItem } from "./TreeItem.interfaces";

import "./TreeItem.scss";

export interface ITreeItemRef {
    setFocusAndEdit: () => void;
    focus: () => void;
    scrollIntoView: () => void;
    scrollTop: () => void;
}

export interface TreeItemProps {
    id: string;
    /**
     * The icon will be displayed on the right of the icon and on the left of the rightAdornment.
     */
    label: string;
    /**
     * Will determine the depth of the item. Margin will be applied on the left of the line (even if it is hidden).
     * Set to 0 if the folder is at the root of the folder tree.
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

        const { fire } = useManipulateDomWhenVisible();

        const inputRef = useRef<HTMLInputElement>(null);
        const isFirstEdit = useRef(true);
        const treeItemDivRef = useRef<HTMLDivElement>(null);

        const handleSetInEditMode = () => {
            // Render our input before focusing it
            flushSync(() => {
                setIsHighlighted(true);
                setIsInEditMode(true);
                setInputValue(label);
            });
            inputRef.current?.focus();
        };

        const handleStopEditMode = (isItemFocusedAfterStop?: boolean) => {
            setIsInEditMode(false);

            if (inputValue !== label) {
                onLabelChanged?.(id, inputValue);
            }
            if (isFirstEdit.current) {
                onFirstEditEnded?.(id, inputValue);
                isFirstEdit.current = false;
            }
            if (isItemFocusedAfterStop) {
                treeItemDivRef.current?.focus();
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

        const handleClickAway = () => {
            if (isInEditMode) {
                handleStopEditMode();
            }
            if (isHighlighted) {
                setIsHighlighted(false);
            }
        };

        const handleInputKeyDown = (
            e: React.KeyboardEvent<HTMLInputElement>
        ) => {
            e.stopPropagation();

            switch (e.key) {
                case "Enter":
                case "Escape":
                    isInEditMode && handleStopEditMode(true);
                    break;
                default:
                    break;
            }
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

        useImperativeHandle(ref, () => ({
            setFocusAndEdit: () => {
                handleSetInEditMode();
            },
            focus: () => {
                treeItemDivRef.current?.focus();
            },
            scrollIntoView: () => {
                fire(treeItemDivRef.current, "scrollIntoViewSmooth");
            },
            scrollTop: () => {
                treeItemDivRef.current?.scroll({
                    top: treeItemDivRef.current.offsetTop,
                });
            },
        }));

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

        const inputClassNames = ["tree-item__input"];
        isInEditMode && inputClassNames.push("tree-item__input--visible");

        return (
            <ClickAwayListener onClickAway={handleClickAway}>
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
                                className={inputClassNames.join(" ")}
                                name="test"
                                value={inputValue}
                                onBlur={() => {
                                    handleStopEditMode();
                                }}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                onFocus={(e) => {
                                    e.target.select();
                                }}
                                onKeyDown={handleInputKeyDown}
                            />
                        )}
                    </span>
                    <div className="tree-item__right-adornment">
                        {rightAdornment && rightAdornment}
                    </div>
                </div>
            </ClickAwayListener>
        );
    }
);

TreeItem.displayName = "TreeItem";
export default TreeItem;

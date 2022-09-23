import "./FolderTree.scss";

import Folder from "./Folder";
import FolderItem from "./FolderItem";
import { TreeItemType, FolderTreeItem, FolderTreeSize } from "./TreeItem.interfaces";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import useRefCallback from "../../../hooks/useRefCallback";
import { TreeItemProps, TreeItemRef } from "./TreeItem";
import { FolderTreeAction } from "./useFolderTree";

export interface FolderTreeRef {
    focusTreeItem: (treeItem: FolderTreeItem, options?: FocusOptions) => void;
    scrollTreeItemIntoView: (treeItem: FolderTreeItem, scrollArgs?: ScrollIntoViewOptions) => void;
}

interface FolderTreeProps {
    /**
     * Hash map containing all the items of the tree.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    treeItemsMap: Map<string, FolderTreeItem>;
    /**
     * An array containing all the items at the root of the tree. Items of type folder might have nested items.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    rooTreeItemsWithNestedItems: FolderTreeItem[];
    /**
     * A sorted array containing all the items of the tree. Each items have their depth and ancestry defined.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    sortedTreeItemsWithDepthAndAncestry: FolderTreeItem[];
    /**
     * The tree item currently selected, which will have it's background color highlighted.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    selectedTreeItem: FolderTreeItem;
    /**
     * The tree item currently focused, which will have a border displayed around it.
        
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    focusedTreeItem: FolderTreeItem;
    /**
     * The TreeItem in edit mode, which will have it's label replaced by the treeItemInEditModeInputValue.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    treeItemInEditMode: FolderTreeItem;
    /**
     * The value of the input of the TreeItem in edit mode, which will have it's label replaced by an input.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    treeItemInEditModeInputValue: string;
    /**
     * A map of all the opened folders of the tree.
        
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    expandedFoldersMap: Map<string, FolderTreeItem>;
    /**
     * All items that are a descendant of the openedParentFolderOfActiveGroup will have their depth line highlighted.
      
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    openedParentFolderOfActiveGroup: FolderTreeItem;
    /**
     * If set to true, the depth lines that are not highlighted will always be visible. 
     
        🚨MAY REDUCE PERFORMANCE🚨
     */
    showInactiveDepthLines?: boolean;
    /**
     * Is set to true, focusing items with keyboard arrows will be disabled.
     */
    disableKeyboardNavigation?: boolean;
    /**
     * The size of the FolderTree or basically the size of all its items.
     * @default "small"
     */
    size?: FolderTreeSize;
    /**
     * The message label displayed when a folder is empty.
     */
    emptyFolderLabel?: string;
    /**
     * Used to synchronize the states between the FolderTree and it's parent component.
     
        🚨The useFolderTree hook provides the dispatcher for this prop.🚨
     */
    folderTreeDispatch?: React.Dispatch<FolderTreeAction>;
    onTreeItemClick?: (treeItem: FolderTreeItem) => void;
    onTreeItemContextMenu?: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        treeItem: FolderTreeItem
    ) => void;
    /**
     * 🚨If not provided, editing items will be disabled.🚨
     */
    onTreeItemEditEnd?: (treeItem: FolderTreeItem) => void;
    onFolderTreeRootContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    folderRightAdornmentComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderIconComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderCaretIconComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderItemIconComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderItemRightAdornmentComponent?: (treeItem: FolderTreeItem) => JSX.Element;
}

const FolderTree = forwardRef<FolderTreeRef, FolderTreeProps>(
    (
        {
            treeItemsMap,
            rooTreeItemsWithNestedItems,
            sortedTreeItemsWithDepthAndAncestry,
            selectedTreeItem,
            focusedTreeItem,
            treeItemInEditMode,
            treeItemInEditModeInputValue,
            expandedFoldersMap,
            openedParentFolderOfActiveGroup,
            showInactiveDepthLines,
            disableKeyboardNavigation,
            size = "small",
            emptyFolderLabel,
            folderTreeDispatch,
            onTreeItemClick,
            onTreeItemContextMenu,
            onTreeItemEditEnd,
            onFolderTreeRootContextMenu,
            onKeyDown,
            onMouseEnter,
            onMouseLeave,
            folderRightAdornmentComponent,
            folderIconComponent,
            folderCaretIconComponent,
            folderItemIconComponent,
            folderItemRightAdornmentComponent,
        }: FolderTreeProps,
        ref
    ) => {
        const {
            setRefCallback: setTreeItemRefCallback,
            getNode: getTreeItemRef,
            setOnNodeAttachedHandler: setTreeItemNodeActionCallback,
        } = useRefCallback<TreeItemRef>();

        useImperativeHandle(ref, () => ({
            focusTreeItem: handleFocusTreeItem,
            scrollTreeItemIntoView: handleScrollTreeItemIntoView,
        }));

        /**
         * The intent behind this effect is to set the input value of the tree item in edit mode and to focus and select it's input,
         * whenever the edit mode it turned on.
         */
        useEffect(() => {
            if (treeItemInEditMode) {
                folderTreeDispatch({
                    type: "setTreeItemInEditModeInputValue",
                    payload: treeItemInEditMode.label,
                });
                setTreeItemNodeActionCallback(treeItemInEditMode.id, (node) =>
                    node.focusAndSelectInput()
                );
            }
        }, [folderTreeDispatch, setTreeItemNodeActionCallback, treeItemInEditMode]);

        const handleOpenFocusedFolder = () => {
            if (!focusedTreeItem || focusedTreeItem?.itemType === TreeItemType.FolderItem) {
                return;
            }

            folderTreeDispatch({ type: "expandFolder", payload: focusedTreeItem });
        };

        const handleCloseFocusedFolder = () => {
            if (!focusedTreeItem || focusedTreeItem?.itemType === TreeItemType.FolderItem) {
                return;
            }

            folderTreeDispatch({ type: "collapseFolder", payload: focusedTreeItem });
        };

        const handleScrollTreeItemIntoView = (
            treeItem: FolderTreeItem,
            scrollArgs: ScrollIntoViewOptions
        ) => {
            if (!treeItem) return;

            getTreeItemRef(treeItem.id)?.scrollIntoView(scrollArgs);
        };

        const handleFocusTreeItem = (treeItem: FolderTreeItem, options?: FocusOptions) => {
            folderTreeDispatch({ type: "setFocusedTreeItem", payload: treeItem });
            getTreeItemRef(treeItem.id)?.focus(options);
        };

        const handleSetSelectedAndFocusedTreeItem = (treeItem: FolderTreeItem) => {
            folderTreeDispatch({ type: "setSelectedAndFocusedTreeItem", payload: treeItem });
        };

        const handleFocusNextTreeItem = (treeItemFromRecursion?: FolderTreeItem) => {
            if (!sortedTreeItemsWithDepthAndAncestry || !sortedTreeItemsWithDepthAndAncestry.length)
                return;

            const selectedOrFocusedTreeItem =
                treeItemFromRecursion ?? focusedTreeItem ?? selectedTreeItem;

            if (!selectedOrFocusedTreeItem) {
                handleFocusTreeItem(sortedTreeItemsWithDepthAndAncestry[0]);
                return;
            }

            const focusedTreeItemIndex = sortedTreeItemsWithDepthAndAncestry.findIndex(
                (treeItem) => treeItem.id === selectedOrFocusedTreeItem?.id
            );

            if (focusedTreeItemIndex === sortedTreeItemsWithDepthAndAncestry.length - 1) {
                // Our focused item is the last item of the tree, we can't go lower.
                return;
            }

            if (
                !treeItemFromRecursion &&
                selectedOrFocusedTreeItem.items?.length &&
                expandedFoldersMap.get(focusedTreeItem?.id) != null // If the item is a folder and it is open with items
            ) {
                handleFocusTreeItem(selectedOrFocusedTreeItem.items[0]);
            } else {
                const parentFolder = treeItemsMap.get(selectedOrFocusedTreeItem.parentFolderId);

                if (!parentFolder) {
                    /**
                     * We are at the root.
                     * Our buildedTreeMemo contains nestedFolderTreeItems which contains all the items at the root of our tree.
                     * See if we can focus an item bellow the tree item passed as an argument from recursion.
                     */
                    const nestedFolderTreeItems = rooTreeItemsWithNestedItems;
                    const treeItemIndex = nestedFolderTreeItems.findIndex(
                        (treeItem) =>
                            treeItem.id ===
                            (treeItemFromRecursion
                                ? treeItemFromRecursion.id
                                : selectedOrFocusedTreeItem.id)
                    );

                    if (nestedFolderTreeItems.length - 1 > treeItemIndex) {
                        handleFocusTreeItem(nestedFolderTreeItems[treeItemIndex + 1]);
                    }
                } else {
                    const treeItemIndex = parentFolder?.items?.findIndex(
                        (item) => item.id === selectedOrFocusedTreeItem.id
                    );

                    if (parentFolder?.items?.length - 1 > treeItemIndex) {
                        handleFocusTreeItem(parentFolder.items[treeItemIndex + 1]);
                    } else {
                        handleFocusNextTreeItem(parentFolder);
                    }
                }
            }
        };

        const handleFocusPreviousItem = (treeItemFromRecursion?: FolderTreeItem) => {
            if (!sortedTreeItemsWithDepthAndAncestry || !sortedTreeItemsWithDepthAndAncestry.length)
                return;

            const selectedOrFocusedTreeItem =
                treeItemFromRecursion ?? focusedTreeItem ?? selectedTreeItem;

            if (!selectedOrFocusedTreeItem) {
                handleFocusTreeItem(sortedTreeItemsWithDepthAndAncestry[0]);
                return;
            }

            const focusedTreeItemIndex = sortedTreeItemsWithDepthAndAncestry.findIndex(
                (treeItem) => treeItem.id === selectedOrFocusedTreeItem?.id
            );

            if (focusedTreeItemIndex === 0) {
                // Our focused item is the first item of the tree, we can't go higher.
                return;
            }

            const previousItem = sortedTreeItemsWithDepthAndAncestry[focusedTreeItemIndex - 1];

            let closedAncestorFolderId = "";
            let areAllAncestorFoldersOpen = true;

            for (const ancestorFolderId of previousItem.ancestorFolderIds) {
                const isAncestorFolderOpen = expandedFoldersMap.get(ancestorFolderId) != null;

                if (!isAncestorFolderOpen) {
                    closedAncestorFolderId = ancestorFolderId;
                    areAllAncestorFoldersOpen = false;
                }
            }

            if (areAllAncestorFoldersOpen) {
                handleFocusTreeItem(previousItem);
            } else {
                const closedAncestorFolder = treeItemsMap.get(closedAncestorFolderId);
                handleFocusPreviousItem(closedAncestorFolder.items?.[0]);
            }
        };

        const handleSetTreeItemInEditMode = (treeItem: FolderTreeItem) => {
            if (!treeItem || !onTreeItemEditEnd) return;

            folderTreeDispatch({
                type: "setTreeItemInEditMode",
                payload: treeItem,
            });
            folderTreeDispatch({
                type: "setTreeItemInEditModeInputValue",
                payload: treeItem.label,
            });
        };

        const handleCancelTreeItemInEditMode = () => {
            folderTreeDispatch({
                type: "setTreeItemInEditModeInputValue",
                payload: "",
            });
            folderTreeDispatch({ type: "setTreeItemInEditMode", payload: null });
            folderTreeDispatch({
                type: "setSelectedAndFocusedTreeItem",
                payload: treeItemInEditMode,
            });
            handleFocusTreeItem(treeItemInEditMode);
        };

        const handleStopTreeItemInEditMode = () => {
            const treeItemInEditModeCopy = {
                ...treeItemInEditMode,
            };

            treeItemInEditModeCopy.label = treeItemInEditModeInputValue;
            folderTreeDispatch({ type: "setTreeItemInEditMode", payload: null });
            folderTreeDispatch({
                type: "setTreeItemInEditModeInputValue",
                payload: "",
            });
            folderTreeDispatch({
                type: "setSelectedAndFocusedTreeItem",
                payload: treeItemInEditModeCopy,
            });
            handleFocusTreeItem(treeItemInEditModeCopy);
            onTreeItemEditEnd(treeItemInEditModeCopy);
        };

        const handleFolderTreeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            switch (e.key) {
                case "F2":
                    handleSetTreeItemInEditMode(focusedTreeItem || selectedTreeItem);
                    break;
                case "Enter":
                    if (treeItemInEditMode) {
                        handleStopTreeItemInEditMode();
                    }
                    break;
                case "Escape":
                    if (treeItemInEditMode) {
                        handleCancelTreeItemInEditMode();
                    }
                    break;
                case "ArrowUp":
                    if (disableKeyboardNavigation) break;

                    e.preventDefault();
                    handleFocusPreviousItem();
                    break;
                case "ArrowDown":
                    if (disableKeyboardNavigation) break;

                    e.preventDefault();
                    handleFocusNextTreeItem();
                    break;
                case "ArrowLeft":
                    if (disableKeyboardNavigation) break;

                    handleCloseFocusedFolder();
                    break;
                case "ArrowRight":
                    if (disableKeyboardNavigation) break;

                    handleOpenFocusedFolder();
                    break;
            }
            onKeyDown?.(e);
        };

        const handleTreeItemInputKeyDown = (
            _treeItem: FolderTreeItem,
            e: React.KeyboardEvent<HTMLInputElement>
        ) => {
            switch (e.key) {
                case "ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight":
                    e.stopPropagation();
                    break;
            }
        };

        const handleTreeItemInEditModeValueChange = (_treeItem: FolderTreeItem, value: string) => {
            folderTreeDispatch({
                type: "setTreeItemInEditModeInputValue",
                payload: value,
            });
        };

        const handleTreeItemInputBlur = () => {
            handleStopTreeItemInEditMode();
        };

        const handleTreeItemClick = (treeItem: FolderTreeItem) => {
            if (treeItem.itemType === TreeItemType.Folder) {
                const isFolderOpen = expandedFoldersMap.get(treeItem.id) != null;

                folderTreeDispatch({
                    type: isFolderOpen ? "collapseFolder" : "expandFolder",
                    payload: treeItem,
                });
            }

            folderTreeDispatch({ type: "setSelectedAndFocusedTreeItem", payload: treeItem });

            onTreeItemClick(treeItem);
        };

        const handleFolderTreeRootClick = () => {
            handleSetSelectedAndFocusedTreeItem(undefined);
        };

        const handleFolderTreeRootContextMenu = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>
        ) => {
            handleSetSelectedAndFocusedTreeItem(undefined);
            onFolderTreeRootContextMenu?.(e);
        };

        const renderTree = (treeItems: FolderTreeItem[]): JSX.Element[] => {
            return treeItems.map((treeItem) => {
                const isDescendentOfOpenedParentFolderOfActiveGroup =
                    treeItem.ancestorFolderIds.some(
                        (ancestorFolderId) =>
                            ancestorFolderId === openedParentFolderOfActiveGroup?.id
                    );

                const sharedProps: TreeItemProps = {
                    depthNumberToHighlight:
                        (treeItem.id === openedParentFolderOfActiveGroup?.id ||
                            isDescendentOfOpenedParentFolderOfActiveGroup) &&
                        openedParentFolderOfActiveGroup.depth,
                    isSelected: selectedTreeItem?.id === treeItem.id,
                    isFocused: focusedTreeItem?.id === treeItem.id,
                    isInEditMode: onTreeItemEditEnd && treeItemInEditMode?.id === treeItem.id,
                    showInactiveDepthLines: showInactiveDepthLines,
                    size,
                    treeItem: treeItem,
                    inEditModeInputValue: treeItemInEditModeInputValue,
                    onClick: handleTreeItemClick,
                    onInputBlur: handleTreeItemInputBlur,
                    onInputValueChange: handleTreeItemInEditModeValueChange,
                    onInputKeydown: handleTreeItemInputKeyDown,
                    onContextMenu: onTreeItemContextMenu,
                };

                if (treeItem.itemType === TreeItemType.FolderItem) {
                    return (
                        <FolderItem
                            {...sharedProps}
                            key={`${treeItem.id}-${treeItem.depth}`}
                            ref={(node) => setTreeItemRefCallback(treeItem.id, node)}
                            icon={folderItemIconComponent && folderItemIconComponent(treeItem)}
                            rightAdornment={
                                folderItemRightAdornmentComponent &&
                                folderItemRightAdornmentComponent(treeItem)
                            }
                        />
                    );
                } else {
                    // We have a folder. We need to render all it's items
                    let folderItems;

                    if (treeItem.items?.length) {
                        folderItems = renderTree(treeItem.items);
                    }

                    return (
                        <Folder
                            {...sharedProps}
                            key={`${treeItem.id}-${treeItem.depth}`}
                            ref={(node) => setTreeItemRefCallback(treeItem.id, node)}
                            caretIcon={
                                folderCaretIconComponent && folderCaretIconComponent(treeItem)
                            }
                            emptyFolderLabel={emptyFolderLabel}
                            icon={folderIconComponent && folderIconComponent(treeItem)}
                            isOpen={expandedFoldersMap.get(treeItem.id) != null}
                            rightAdornment={
                                folderRightAdornmentComponent &&
                                folderRightAdornmentComponent(treeItem)
                            }
                        >
                            {folderItems}
                        </Folder>
                    );
                }
            });
        };

        return (
            <div
                className="folder-tree"
                tabIndex={0} // Needed for focus
                onKeyDown={handleFolderTreeKeyDown}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {renderTree(rooTreeItemsWithNestedItems)}
                <div
                    className="folder-tree__footer"
                    onClick={handleFolderTreeRootClick}
                    onContextMenu={handleFolderTreeRootContextMenu}
                ></div>
            </div>
        );
    }
);

FolderTree.displayName = "FolderTree";
export default FolderTree;

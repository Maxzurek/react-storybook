import "./FolderTree.scss";

import { TreeItemType, FolderTreeItem, FolderTreeSize } from "./TreeItem.interfaces";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import useRefMap from "../../../hooks/useRefMap";
import { TreeItemProps, TreeItemRef } from "./TreeItem";
import { FolderTreeAction } from "./useFolderTree";
import DropZone from "../../dragAndDrop/DropZone";
import Folder from "./Folder";
import FolderItem from "./FolderItem";

export interface FolderTreeRef {
    focusTreeItem: (treeItem: FolderTreeItem, options?: FocusOptions) => void;
    focusAndSelectTreeItem: (treeItem: FolderTreeItem, options?: FocusOptions) => void;
    scrollTreeItemIntoView: (
        treeItem: FolderTreeItem,
        scrollArgs?: ScrollIntoViewOptions,
        intersectionRatio?: number
    ) => void;
}

interface FolderTreeProps {
    //#region Props
    /**
     * Hash map containing all the items of the tree.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    treeItemsMap: Map<string, FolderTreeItem>;
    /**
     * An array containing all the items at the root of the tree. Items of type folder might have nested items.
     
        🚨The useFolderTree hook provides the state used for this prop.🚨
     */
    rootTreeItemsWithNestedItems: FolderTreeItem[];
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
     * If set to true, all depth lines will be hidden.
     */
    hideDepthLines?: boolean;
    /**
     * Is set to true, focusing items with keyboard arrows will be disabled.
     */
    disableKeyboardNavigation?: boolean;
    /**
     * If set to true, drag and drop will be disabled.
     */
    disableDragAndDrop?: boolean;
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
    //#endregion

    //#region Events
    onTreeItemClick?: (treeItem: FolderTreeItem) => void;
    onTreeItemContextMenu?: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        treeItem: FolderTreeItem
    ) => void;
    /**
     * 🚨If not provided, editing items will be disabled.🚨
     */
    onTreeItemEditEnd?: (treeItem: FolderTreeItem) => void;
    onFolderDrop?: (treeItemSource: FolderTreeItem, treeItemDestination: FolderTreeItem) => void;
    onFolderTreeRootContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    //#endregion

    //#region Component props
    folderCaretIconComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderIconComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    /**
     * 🚨If provided, editing items will be disabled.🚨
     */
    folderLabelComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderLeftAdornmentComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderRightAdornmentComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderItemIconComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    /**
     * 🚨If provided, editing items will be disabled.🚨
     */
    folderItemLabelComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderItemBodyComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderItemLeftAdornmentComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    folderItemRightAdornmentComponent?: (treeItem: FolderTreeItem) => JSX.Element;
    //#endregion
}

const FolderTree = forwardRef<FolderTreeRef, FolderTreeProps>(
    (
        {
            treeItemsMap,
            rootTreeItemsWithNestedItems,
            sortedTreeItemsWithDepthAndAncestry,
            selectedTreeItem,
            focusedTreeItem,
            treeItemInEditMode,
            treeItemInEditModeInputValue,
            expandedFoldersMap,
            openedParentFolderOfActiveGroup,
            showInactiveDepthLines,
            hideDepthLines,
            disableKeyboardNavigation,
            disableDragAndDrop,
            size = "small",
            emptyFolderLabel,
            folderTreeDispatch,
            onTreeItemClick,
            onTreeItemContextMenu,
            onTreeItemEditEnd,
            onFolderDrop,
            onFolderTreeRootContextMenu,
            onKeyDown,
            onMouseEnter,
            onMouseLeave,
            folderLeftAdornmentComponent,
            folderRightAdornmentComponent,
            folderIconComponent,
            folderLabelComponent,
            folderCaretIconComponent,
            folderItemIconComponent,
            folderItemLabelComponent,
            folderItemBodyComponent,
            folderItemLeftAdornmentComponent,
            folderItemRightAdornmentComponent,
        }: FolderTreeProps,
        ref
    ) => {
        const {
            setRefMap: setTreeItemRefMap,
            getRef: getTreeItemRef,
            onRefAttached: onTreeItemRefAttached,
        } = useRefMap<TreeItemRef>();

        const [isDraggedOver, setIsDraggedOver] = useState(false);

        useImperativeHandle(ref, () => ({
            focusTreeItem: handleFocusTreeItem,
            focusAndSelectTreeItem: handleFocusAndSelectTreeItemInput,
            scrollTreeItemIntoView: handleScrollTreeItemIntoView,
        }));

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

        const handleScrollTreeItemIntoView = async (
            treeItem: FolderTreeItem,
            scrollArgs?: ScrollIntoViewOptions,
            intersectionRatio?: number
        ) => {
            if (!treeItem) return;

            folderTreeDispatch({ type: "expandTreeItemAncestorFolders", payload: treeItem });
            getTreeItemRef(treeItem.id)?.scrollIntoView(scrollArgs, intersectionRatio);
        };

        const handleFocusTreeItem = async (treeItem: FolderTreeItem, options?: FocusOptions) => {
            folderTreeDispatch({ type: "setFocusedTreeItem", payload: treeItem });

            const treeItemElement = await onTreeItemRefAttached(treeItem?.id);
            treeItemElement.focusDiv(options);
        };

        const handleFocusAndSelectTreeItemInput = async (
            treeItem: FolderTreeItem,
            options?: FocusOptions
        ) => {
            folderTreeDispatch({ type: "setFocusedTreeItem", payload: treeItem });

            const treeItemElement = await onTreeItemRefAttached(treeItem?.id);
            treeItemElement.focusAndSelectInput(options);
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
                    const treeItemIndex = rootTreeItemsWithNestedItems.findIndex(
                        (treeItem) =>
                            treeItem.id ===
                            (treeItemFromRecursion
                                ? treeItemFromRecursion.id
                                : selectedOrFocusedTreeItem.id)
                    );

                    if (rootTreeItemsWithNestedItems.length - 1 > treeItemIndex) {
                        handleFocusTreeItem(rootTreeItemsWithNestedItems[treeItemIndex + 1]);
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

        const handleSetTreeItemInEditMode = (treeItem: FolderTreeItem, inputValue: string) => {
            const isFolder = treeItem.itemType === TreeItemType.Folder;

            if (!treeItem || !onTreeItemEditEnd) return;
            if ((isFolder && folderLabelComponent) || (!isFolder && folderItemLabelComponent))
                // If the label component is provided, we don't want to set edit mode.
                return;

            folderTreeDispatch({
                type: "setTreeItemInEditMode",
                payload: { treeItem, inputValue },
            });
        };

        const handleCancelTreeItemInEditMode = () => {
            folderTreeDispatch({ type: "setTreeItemInEditMode", payload: null });
            folderTreeDispatch({
                type: "setSelectedAndFocusedTreeItem",
                payload: treeItemInEditMode,
            });
            handleFocusTreeItem(treeItemInEditMode, { preventScroll: true });
        };

        const handleStopTreeItemInEditMode = () => {
            const treeItemInEditModeCopy = {
                ...treeItemInEditMode,
                label: treeItemInEditModeInputValue,
            };

            folderTreeDispatch({ type: "setTreeItemInEditMode", payload: null });
            folderTreeDispatch({
                type: "setSelectedAndFocusedTreeItem",
                payload: treeItemInEditModeCopy,
            });
            handleFocusTreeItem(treeItemInEditMode, { preventScroll: true });
            onTreeItemEditEnd(treeItemInEditModeCopy);
        };

        const handleFolderTreeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            switch (e.key) {
                case "F2":
                    {
                        const focusedOrSelectedTreeItem = focusedTreeItem || selectedTreeItem;

                        handleSetTreeItemInEditMode(
                            focusedOrSelectedTreeItem,
                            focusedOrSelectedTreeItem?.label
                        );
                    }
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

            onTreeItemClick?.(treeItem);
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

        const handleRootDragOver = (
            e: React.DragEvent<HTMLDivElement>,
            dataTransfer: DataTransfer
        ) => {
            const data = dataTransfer.getData("text/plain");
            const sourceTreeItem = JSON.parse(data) as FolderTreeItem;

            folderTreeDispatch({ type: "setOpenedParentFolderOfActiveGroup", payload: null });

            const treeItemAtTheRootOfTree = rootTreeItemsWithNestedItems?.find(
                (treeItem) => treeItem.id === sourceTreeItem.id
            );

            if (treeItemAtTheRootOfTree) return;

            setIsDraggedOver(true);
        };

        const handleFolderDragOver = (
            sourceTreeItem: FolderTreeItem,
            destinationTreeItem: FolderTreeItem,
            isDestinationItemParentOfSourceItem?: boolean,
            isDestinationItemChildOfSourceItem?: boolean
        ) => {
            if (!isDestinationItemParentOfSourceItem && !isDestinationItemChildOfSourceItem) {
                folderTreeDispatch({ type: "expandFolder", payload: destinationTreeItem });
            } else {
                folderTreeDispatch({ type: "expandFolder", payload: sourceTreeItem });
            }
        };

        const handleRootDragLeave = () => {
            setIsDraggedOver(false);
        };

        const handleFolderDrop = (
            sourceTreeItem: FolderTreeItem,
            destinationTreeItem: FolderTreeItem
        ) => {
            onFolderDrop(sourceTreeItem, destinationTreeItem);
        };

        const handleRootDrop = (
            _e: React.DragEvent<HTMLDivElement>,
            dataTransfer: DataTransfer
        ) => {
            const data = dataTransfer.getData("text/plain");
            const sourceTreeItem = JSON.parse(data) as FolderTreeItem;
            const isParentFolderOfSourceItem = rootTreeItemsWithNestedItems?.find(
                (treeItem) => treeItem.id === sourceTreeItem.id
            );

            if (isParentFolderOfSourceItem) return;

            const rootFolderItem: FolderTreeItem = {
                // TODO We don't have a root folder rendered so we need to simulate one. Maybe change that later?
                id: undefined,
                itemType: TreeItemType.Folder,
                parentFolderId: undefined,
                label: "folder-tree-item__root-folder",
            };

            setIsDraggedOver(false);
            onFolderDrop(sourceTreeItem, rootFolderItem);
        };

        const renderTree = (treeItems: FolderTreeItem[]): JSX.Element[] => {
            return treeItems.map((treeItem) => {
                const isDescendentOfOpenedParentFolderOfActiveGroup =
                    treeItem.ancestorFolderIds.some(
                        (ancestorFolderId) =>
                            ancestorFolderId === openedParentFolderOfActiveGroup?.id
                    );
                const isFolder = treeItem.itemType === TreeItemType.Folder;
                const depthNumberToHighlight =
                    treeItem.id === openedParentFolderOfActiveGroup?.id ||
                    isDescendentOfOpenedParentFolderOfActiveGroup
                        ? openedParentFolderOfActiveGroup.depth
                        : undefined;

                const sharedProps: TreeItemProps = {
                    depthNumberToHighlight,
                    isSelected: selectedTreeItem?.id === treeItem.id,
                    isFocused: focusedTreeItem?.id === treeItem.id,
                    isInEditMode:
                        onTreeItemEditEnd &&
                        (isFolder ? !folderLabelComponent : !folderItemLabelComponent) &&
                        treeItemInEditMode?.id === treeItem.id,
                    showInactiveDepthLines: showInactiveDepthLines,
                    size,
                    treeItem: treeItem,
                    inEditModeInputValue:
                        treeItemInEditMode?.id === treeItem.id ? treeItemInEditModeInputValue : "",
                    hideDepthLines,
                    isDraggableDisabled: disableDragAndDrop,
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
                            key={`folder-item-${treeItem.id}`}
                            ref={(node) => setTreeItemRefMap(treeItem.id, node)}
                            bodyElement={folderItemBodyComponent?.(treeItem)}
                            iconElement={folderItemIconComponent?.(treeItem)}
                            labelElement={folderItemLabelComponent?.(treeItem)}
                            leftAdornmentElement={folderItemLeftAdornmentComponent?.(treeItem)}
                            rightAdornmentElement={folderItemRightAdornmentComponent?.(treeItem)}
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
                            key={`folder-${treeItem.id}-${treeItem.depth}`}
                            ref={(node) => setTreeItemRefMap(treeItem.id, node)}
                            caretIconElement={folderCaretIconComponent?.(treeItem)}
                            emptyFolderLabel={emptyFolderLabel}
                            iconElement={folderIconComponent && folderIconComponent(treeItem)}
                            isOpen={expandedFoldersMap.get(treeItem.id) != null}
                            labelElement={folderLabelComponent?.(treeItem)}
                            leftAdornmentElement={folderLeftAdornmentComponent?.(treeItem)}
                            rightAdornmentElement={folderRightAdornmentComponent?.(treeItem)}
                            onDragOver={handleFolderDragOver}
                            onDrop={handleFolderDrop}
                        >
                            {folderItems}
                        </Folder>
                    );
                }
            });
        };

        const dropZoneClassNames = ["folder-tree__drop-zone"];
        isDraggedOver && dropZoneClassNames.push("folder-tree__drop-zone--dragged-over");

        return (
            <div
                className="folder-tree"
                tabIndex={0} // Needed for focus
                onKeyDown={handleFolderTreeKeyDown}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <DropZone
                    className={dropZoneClassNames.join(" ")}
                    id={"folder-tree-root"}
                    onDragLeave={handleRootDragLeave}
                    onDragOver={handleRootDragOver}
                    onDrop={handleRootDrop}
                >
                    {renderTree(rootTreeItemsWithNestedItems)}
                    <div
                        className="folder-tree__footer"
                        onClick={handleFolderTreeRootClick}
                        onContextMenu={handleFolderTreeRootContextMenu}
                    />
                </DropZone>
            </div>
        );
    }
);

FolderTree.displayName = "FolderTree";
export default FolderTree;

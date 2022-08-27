import Folder, { IFolderRef } from "./Folder";
import FolderItem, { IFolderItemRef } from "./FolderItem";
import {
    TreeItemType,
    ITreeItem,
    TreeSearchResult,
} from "./TreeItem.interfaces";
import React, { useMemo, useRef, useState } from "react";
import useRefMap from "../../../hooks/useRefMap";
import FolderTreeHeader, { FolderTreeHeaderRef } from "./FolderTreeHeader";
import { flushSync } from "react-dom";
import {
    searchTree,
    getTraversedAndSortedTree,
    createTreeItem,
    initialTreeItems,
    rootFolderId,
} from "./FolderTree.utils";
import { ITreeItemRef } from "./TreeItem";
import RootFolder from "./RootFolder";

export default function FolderTree() {
    const { setRefCallback: setFolderRefCallback, getRef: getFolderRef } =
        useRefMap<IFolderRef>();
    const {
        setRefCallback: setFolderItemRefCallback,
        getRef: getFolderItemRef,
    } = useRefMap<IFolderItemRef>();

    const [treeItems, setTreeItems] = useState<ITreeItem[]>(initialTreeItems); // Tree items are automatically sorted by our traversedAndSortedTreeMemo
    const [selectedTreeItem, setSelectedTreeItem] = useState<ITreeItem>();
    const [isSelectedFolderOpen, setIsSelectedFolderOpen] = useState(false);
    const [isTreeHovered, setHasMouseEntered] = useState(false);

    const headerRef = useRef<FolderTreeHeaderRef>();
    const focusedTreeItemRef = useRef<ITreeItem>(); // We don't want our focused tree item to cause a rerender every time is changes

    const traversedAndSortedTreeMemo = useMemo(
        () => getTraversedAndSortedTree(treeItems),
        [treeItems]
    );

    /**
     * We want to memoize our active folder.
     *
     * If the selected item is a Folder and it is OPEN,
     * the active folder is the selected item.
     *
     * If the selected item is a Folder and it is CLOSE,
     * the active folder would be the closest open ancestor folder of the selected item.
     *
     * If the selected item is a FolderItem,
     * the active folder is the parent folder of the selected item.
     */
    const selectedItemParentFolderMemo = useMemo(() => {
        if (!selectedTreeItem) return;

        let selectedItemParentFolder = selectedTreeItem;
        const isSelectedItemFolder =
            selectedTreeItem.itemType === TreeItemType.Folder;

        if (isSelectedItemFolder) {
            const ancestorFolderIds = selectedTreeItem?.ancestorFolderIds;

            if (!isSelectedFolderOpen && ancestorFolderIds) {
                for (const ancestorFolderId of ancestorFolderIds) {
                    const isAncestorFolderOpen =
                        getFolderRef(ancestorFolderId)?.isFolderOpen();

                    selectedItemParentFolder = isAncestorFolderOpen
                        ? traversedAndSortedTreeMemo.find(
                              (treeItem) => treeItem.id === ancestorFolderId
                          )
                        : selectedItemParentFolder;
                }
            }
        } else {
            selectedItemParentFolder = traversedAndSortedTreeMemo.find(
                (treeItem) => treeItem.id === selectedTreeItem.parentFolderId
            );
        }

        return selectedItemParentFolder;
    }, [
        getFolderRef,
        isSelectedFolderOpen,
        selectedTreeItem,
        traversedAndSortedTreeMemo,
    ]);

    const handleCollapseOrExpandFolders = (
        treeItems: ITreeItem[],
        isActionToCollapse: boolean
    ) => {
        for (const treeItem of treeItems) {
            if (treeItem.itemType === TreeItemType.RootFolder) {
                handleCollapseOrExpandFolders(
                    treeItem.items,
                    isActionToCollapse
                );
            } else if (treeItem.itemType === TreeItemType.Folder) {
                const folderRef = getFolderRef(treeItem.id);

                isActionToCollapse
                    ? folderRef?.closeFolder()
                    : folderRef?.openFolder();

                if (treeItem.items) {
                    handleCollapseOrExpandFolders(
                        treeItem.items,
                        isActionToCollapse
                    );
                }
            }
        }
    };

    const handleScrollSelectedItemIntoView = () => {
        if (!selectedTreeItem) return;

        if (selectedTreeItem.itemType === TreeItemType.Folder) {
            getFolderRef(selectedTreeItem.id)?.scrollIntoView();
        } else {
            getFolderItemRef(selectedTreeItem.id)?.scrollIntoView();
        }
    };

    const handleAddTreeItem = (treeItemType: TreeItemType) => {
        const treeItemsCopy = [...treeItems];
        const isSelectedItemFolder =
            selectedTreeItem?.itemType === TreeItemType.Folder;
        const newTreeItem = createTreeItem(treeItemType, selectedTreeItem);

        if (
            !selectedTreeItem ||
            (!isSelectedItemFolder && selectedTreeItem.depth === 0)
        ) {
            // We want to add an item at the root of our tree.
            treeItemsCopy
                .find(
                    (treeItem) => treeItem.itemType === TreeItemType.RootFolder
                )
                ?.items?.push(newTreeItem);
        } else if (isSelectedItemFolder) {
            // We have a folder selected. Add the new item to it's items
            selectedTreeItem.items?.push(newTreeItem);
        } else {
            // We have FolderItem that is inside a folder. We need to get it's parent folder and add the new item to its items
            const parentFolder = searchTree(
                treeItemsCopy,
                selectedTreeItem?.parentFolderId
            ).treeItem;
            parentFolder?.items?.push(newTreeItem);
        }

        // If we have a selectedTreeItem and it is a folder, we need to open it to render our new treeItem
        if (isSelectedItemFolder) {
            getFolderRef(selectedTreeItem.id)?.openFolder();
        }

        // Our new treeItem needs to be rendered in order to focus it and set edit mode on
        flushSync(() => {
            handleSelectTreeItem(newTreeItem);
            setTreeItems([...treeItemsCopy]);
        });

        // Focus and start editing our new treeItem
        handleFocusAndEditTreeItem(newTreeItem.id, newTreeItem.itemType);
    };

    const handleFocusAndEditTreeItem = (
        newTreeItemId: string,
        treeItemType: TreeItemType
    ) => {
        if (treeItemType === TreeItemType.Folder) {
            getFolderRef(newTreeItemId)?.setFocusAndEdit();
        } else {
            getFolderItemRef(newTreeItemId)?.setFocusAndEdit();
        }
    };

    /**
     * WILL USE LATER ?
     * @param treeItem
     */
    const _handleScrollItemIntoView = (treeItem: ITreeItem) => {
        for (const ancestorFolderId of treeItem.ancestorFolderIds) {
            getFolderRef(ancestorFolderId)?.openFolder();
        }

        if (treeItem.itemType === TreeItemType.Folder) {
            getFolderRef(treeItem.id)?.scrollIntoView();
        } else {
            getFolderItemRef(treeItem.id)?.scrollIntoView();
        }
    };

    /**
     * After adding a new item to the tree, this item is automatically focused and set to editing mode.
     * After the editing (naming of the item) is done, this function is called.
     * If the label is empty, meaning the user didn't name the new item, we want to remove it from the tree.
     * If the name is defined, we want to update the tree (with the new item)
     *
     * @param itemId
     * @param labelValue
     */
    const handleFirstEditEnded = (itemId: string, labelValue: string) => {
        if (!labelValue && !labelValue.length) {
            handleRemoveItem(itemId);
        } else {
            // Update the new item and rerender it before scrolling to it
            flushSync(() => {
                handleUpdateTreeItemLabel(itemId, labelValue);
            });
        }
    };

    const handleRemoveItem = (itemId: string) => {
        const treeItemsCopy = [...treeItems];
        const itemToRemoveSearchResult = searchTree(treeItemsCopy, itemId);
        const itemToRemove = itemToRemoveSearchResult.treeItem;
        const hasParentFolder = itemToRemove?.parentFolderId;

        if (hasParentFolder) {
            const parentFolderSearchResult: TreeSearchResult = searchTree(
                treeItemsCopy,
                itemToRemove.parentFolderId ?? ""
            );
            const parentFolder = parentFolderSearchResult.treeItem;

            parentFolder?.items?.splice(itemToRemoveSearchResult.index, 1);
            handleSelectTreeItem(parentFolder);
        } else {
            treeItemsCopy.splice(itemToRemoveSearchResult.index, 1);
            handleSelectTreeItem(undefined);
        }

        setTreeItems([...treeItemsCopy]);
    };

    const handleUpdateTreeItemLabel = (itemId: string, newLabel: string) => {
        const treeItemsCopy = [...treeItems];
        const itemToUpdate = searchTree(treeItemsCopy, itemId).treeItem;

        if (itemToUpdate) {
            itemToUpdate.label = newLabel;
        }

        setTreeItems(treeItemsCopy);
    };

    const handleSelectTreeItem = (treeItem: ITreeItem) => {
        setSelectedTreeItem(treeItem);
        focusedTreeItemRef.current = treeItem;

        if (treeItem?.itemType === TreeItemType.Folder) {
            setIsSelectedFolderOpen(getFolderRef(treeItem.id)?.isFolderOpen());
        }
    };

    const handleFocusTreeItem = (treeItem: ITreeItem) => {
        let treeItemRef: ITreeItemRef | IFolderRef;

        if (treeItem?.itemType === TreeItemType.Folder) {
            treeItemRef = getFolderRef(treeItem.id);
        } else {
            treeItemRef = getFolderItemRef(treeItem.id);
        }

        treeItemRef.focus();
        focusedTreeItemRef.current = treeItem;
    };

    const handleFocusPreviousItem = (treeItem: ITreeItem) => {
        const treeItemIndex = traversedAndSortedTreeMemo?.findIndex(
            (item) => item.id === treeItem.id
        );

        if (treeItemIndex === 0) return;

        const previousItem = traversedAndSortedTreeMemo[treeItemIndex - 1];

        if (previousItem.itemType === TreeItemType.RootFolder) return;

        let closedAncestorFolderId = "";
        let areAllAncestorFoldersOpen = true;

        for (const ancestorFolderId of previousItem.ancestorFolderIds) {
            if (ancestorFolderId === rootFolderId) continue;

            const isAncestorFolderOpen =
                getFolderRef(ancestorFolderId)?.isFolderOpen();

            if (!isAncestorFolderOpen) {
                closedAncestorFolderId = ancestorFolderId;
                areAllAncestorFoldersOpen = false;
            }
        }

        if (areAllAncestorFoldersOpen) {
            handleFocusTreeItem(previousItem);
        } else {
            const closedAncestorFolder = traversedAndSortedTreeMemo.find(
                (treeItem) => treeItem.id === closedAncestorFolderId
            );
            handleFocusPreviousItem(closedAncestorFolder.items?.[0]);
        }
    };

    const handleFocusNextTreeItem = (treeItem: ITreeItem) => {
        if (!treeItem) return; // We are at the root

        if (
            treeItem.itemType === TreeItemType.Folder &&
            getFolderRef(focusedTreeItemRef.current?.id)?.isFolderOpen() &&
            treeItem.items?.length // If the item is a folder and it is open with items
        ) {
            handleFocusTreeItem(treeItem.items[0]);
        } else {
            const parentFolder = traversedAndSortedTreeMemo.find(
                (item) => item.id === treeItem.parentFolderId
            );
            const treeItemIndex = parentFolder?.items?.findIndex(
                (item) => item.id === treeItem.id
            );

            if (parentFolder?.items?.length - 1 > treeItemIndex) {
                handleFocusTreeItem(parentFolder.items[treeItemIndex + 1]);
            } else {
                handleFocusNextTreeItem(parentFolder);
            }
        }
    };

    const handleArrowUpOrDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!traversedAndSortedTreeMemo || !traversedAndSortedTreeMemo.length)
            return;

        const isFocusPrevious = e.key === "ArrowUp";
        const isFocusNext = e.key === "ArrowDown";
        const focusedTreeItemIndex = traversedAndSortedTreeMemo.findIndex(
            (treeItem) => treeItem.id === focusedTreeItemRef.current?.id
        );

        if (isFocusPrevious && focusedTreeItemIndex === 0) {
            // Our focused item is the first item of the tree, we can't go higher.
            return;
        } else if (
            isFocusNext &&
            focusedTreeItemIndex === traversedAndSortedTreeMemo.length - 1
        ) {
            // Our focused item is the last item of the tree, we can't go lower.
            return;
        } else if (!selectedTreeItem && !focusedTreeItemRef.current) {
            handleFocusTreeItem(traversedAndSortedTreeMemo[0]);
            return;
        }

        const selectedOrFocusedTreeItem =
            focusedTreeItemRef.current ?? selectedTreeItem;

        if (e.key === "ArrowUp") {
            handleFocusPreviousItem(selectedOrFocusedTreeItem);
        } else if (e.key === "ArrowDown") {
            handleFocusNextTreeItem(selectedOrFocusedTreeItem);
        }
    };

    const handleArrowLeftOrRight = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (
            !focusedTreeItemRef.current ||
            focusedTreeItemRef.current?.itemType === TreeItemType.FolderItem
        ) {
            return;
        }

        const folderRef = getFolderRef(focusedTreeItemRef.current?.id);
        folderRef && e.key === "ArrowLeft"
            ? folderRef.closeFolder()
            : folderRef.openFolder();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
                e.preventDefault();
                handleArrowUpOrDown(e);
                break;
            case "ArrowLeft":
            case "ArrowRight":
                handleArrowLeftOrRight(e);
                break;
            default:
                break;
        }
    };

    const handleMouseEnter = () => {
        headerRef.current?.setIsVisible(true);
        setHasMouseEntered(true);
    };

    const handleMouseLeave = () => {
        headerRef.current?.setIsVisible(false);
        setHasMouseEntered(false);
    };

    const handleExpandFolders = () => {
        handleCollapseOrExpandFolders(treeItems, false);
        handleScrollSelectedItemIntoView();
    };

    const handleTreeItemRootClick = () => {
        setSelectedTreeItem(undefined);
    };

    const renderTree = (treeItems: ITreeItem[]): JSX.Element[] => {
        return treeItems.map((treeItem) => {
            if (treeItem.itemType === TreeItemType.RootFolder) {
                // We have a folder. We need to render all it's items
                let folderItems;

                if (treeItem.items?.length) {
                    folderItems = renderTree(treeItem.items);
                }

                return (
                    <RootFolder key={`${treeItem.id}-${treeItem.depth}`}>
                        {folderItems}
                    </RootFolder>
                );
            } else if (treeItem.itemType === TreeItemType.FolderItem) {
                return (
                    <FolderItem
                        key={`${treeItem.id}-${treeItem.depth}`}
                        ref={(node) =>
                            setFolderItemRefCallback(treeItem.id, node)
                        }
                        activeFolder={selectedItemParentFolderMemo}
                        ancestorFolderIds={treeItem.ancestorFolderIds}
                        depth={treeItem.depth}
                        hideInactiveBranchLine={!isTreeHovered}
                        id={treeItem.id}
                        isSelected={selectedTreeItem?.id === treeItem.id}
                        label={treeItem.label}
                        onFirstEditEnded={handleFirstEditEnded}
                        onItemClick={() => {
                            handleSelectTreeItem(treeItem);
                        }}
                        onLabelChanged={handleUpdateTreeItemLabel}
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
                        key={`${treeItem.id}-${treeItem.depth}`}
                        ref={(node) => setFolderRefCallback(treeItem.id, node)}
                        activeFolder={selectedItemParentFolderMemo}
                        ancestorFolderIds={treeItem.ancestorFolderIds}
                        depth={treeItem.depth}
                        hideInactiveBranchLine={!isTreeHovered}
                        id={treeItem.id}
                        isSelected={selectedTreeItem?.id === treeItem.id}
                        label={treeItem.label}
                        onFirstEditEnded={handleFirstEditEnded}
                        onItemClick={() => {
                            handleSelectTreeItem(treeItem);
                        }}
                        onLabelChanged={handleUpdateTreeItemLabel}
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
            tabIndex={0}
            onKeyDownCapture={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <FolderTreeHeader
                ref={headerRef}
                onAddTreeItem={handleAddTreeItem}
                onClick={() => setSelectedTreeItem(undefined)}
                onCollapseFolders={() => {
                    handleCollapseOrExpandFolders(treeItems, true);
                }}
                onExpandFolders={handleExpandFolders}
            />
            {renderTree(treeItems)}
            <div
                role="Select root on click"
                style={{ height: "30px" }}
                onClick={handleTreeItemRootClick}
            />
        </div>
    );
}

import { generateRandomId } from "../../../utilities/Math.utils";
import Folder, { IFolderRef } from "./Folder";
import FolderItem, { IFolderItemRef } from "./FolderItem";
import {
    ETreeItemType,
    ITreeItem,
    ITreeSearchResult,
} from "./TreeItem.interfaces";
import { useMemo, useRef, useState } from "react";
import useRefCallback from "../../../hooks/useRefCallback";
import FolderTreeHeader, { FolderTreeHeaderRef } from "./FolderTreeHeader";
import { flushSync } from "react-dom";
import { searchTree, getTraversedAndSortedTree } from "./FolderTree.utils";

const folderOneId = generateRandomId();
const firstItemId = generateRandomId();

const initialTreeItems: ITreeItem[] = [
    {
        id: folderOneId,
        itemType: ETreeItemType.Folder,
        label: "Folder 1",
        depth: 0,
        items: [
            {
                id: firstItemId,
                itemType: ETreeItemType.FolderItem,
                label: "Item 1",
                depth: 1,
                parentFolderId: folderOneId,
            },
        ],
    },
];

export default function FolderTree() {
    const { setRefCallback: setFolderRefCallback, getRef: getFolderRef } =
        useRefCallback<IFolderRef>();
    const {
        setRefCallback: setFolderItemRefCallback,
        getRef: getFolderItemRef,
    } = useRefCallback<IFolderItemRef>();

    // Tree items are automatically sorted by sortTreeItemsByRenderingOrder
    const [treeItems, setTreeItems] = useState<ITreeItem[]>(initialTreeItems);
    const [selectedTreeItem, setSelectedTreeItem] = useState<ITreeItem>();
    const [isTreeHovered, setHasMouseEntered] = useState(false);

    const headerRef = useRef<FolderTreeHeaderRef>();
    const focusedTreeItemRef = useRef<ITreeItem>();

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
    const activeFolderMemo = useMemo(() => {
        if (!selectedTreeItem) return;

        let activeFolder = selectedTreeItem;
        const isSelectedItemFolder =
            selectedTreeItem.itemType === ETreeItemType.Folder;

        if (isSelectedItemFolder) {
            const isSelectedFolderOpen = getFolderRef(
                selectedTreeItem.id
            )?.isFolderOpen();
            const ancestorFolderIds = selectedTreeItem?.ancestorFolderIds;

            if (!isSelectedFolderOpen && ancestorFolderIds) {
                for (const ancestorFolderId of ancestorFolderIds) {
                    const isAncestorFolderOpen =
                        getFolderRef(ancestorFolderId)?.isFolderOpen();

                    activeFolder = isAncestorFolderOpen
                        ? traversedAndSortedTreeMemo.find(
                              (treeItem) => treeItem.id === ancestorFolderId
                          )
                        : activeFolder;
                }
            }
        } else {
            activeFolder = traversedAndSortedTreeMemo.find(
                (treeItem) => treeItem.id === selectedTreeItem.parentFolderId
            );
        }

        return activeFolder;
    }, [getFolderRef, selectedTreeItem, traversedAndSortedTreeMemo]);

    const handleCollapseOrExpandFolders = (
        treeItems: ITreeItem[],
        isActionToCollapse: boolean
    ) => {
        for (const treeItem of treeItems) {
            if (treeItem.itemType === ETreeItemType.Folder) {
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

    const handleAddTreeItem = (treeItemType: ETreeItemType) => {
        const treeItemCopy = [...treeItems];
        const isNewItemFolder = treeItemType === ETreeItemType.Folder;
        const isSelectedItemFolder =
            selectedTreeItem?.itemType === ETreeItemType.Folder;

        const parentFolderId = !selectedTreeItem
            ? undefined // No treeItem selected, we are at the root of our folder tree
            : isSelectedItemFolder
            ? selectedTreeItem.id
            : selectedTreeItem?.parentFolderId;

        const newTreeItem: ITreeItem = {
            id: generateRandomId(),
            depth: !selectedTreeItem
                ? 0 // No treeItem selected, we are at the root of our folder tree
                : isSelectedItemFolder
                ? selectedTreeItem.depth + 1
                : selectedTreeItem.depth,
            itemType: treeItemType,
            label: "",
            parentFolderId: parentFolderId,
            items: isNewItemFolder ? [] : undefined,
        };

        if (
            !selectedTreeItem ||
            (!isSelectedItemFolder && selectedTreeItem.depth === 0)
        ) {
            // We want to add an item at the root of our tree.
            treeItemCopy.push(newTreeItem);
        } else if (isSelectedItemFolder) {
            // We have a folder selected. Add the new item to it's items
            selectedTreeItem.items?.push(newTreeItem);
        } else {
            // We have FolderItem that is inside a folder. We need to get it's parent folder and add the new item to its items
            const parentFolder = searchTree(
                treeItemCopy,
                selectedTreeItem.parentFolderId
            ).treeItem;
            parentFolder?.items?.push(newTreeItem);
        }

        // If we have a selectedTreeItem and it is a folder, we need to open it to render our new treeItem
        isSelectedItemFolder && getFolderRef(selectedTreeItem.id)?.openFolder();

        // Our new treeItem needs to be rendered in order to focus it and set edit mode on
        flushSync(() => {
            handleTreeItemClick(newTreeItem);
            setTreeItems([...treeItemCopy]);
        });

        // Focus and start editing our new treeItem
        handleFocusAndEditTreeItem(newTreeItem.id, newTreeItem.itemType);
    };

    const handleFocusAndEditTreeItem = (
        newTreeItemId: string,
        treeItemType: ETreeItemType
    ) => {
        if (treeItemType === ETreeItemType.Folder) {
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

        if (treeItem.itemType === ETreeItemType.Folder) {
            getFolderRef(treeItem.id)?.scrollIntoView();
        } else {
            getFolderItemRef(treeItem.id)?.scrollIntoView();
        }
    };

    /**
     * After adding a new item to the tree, this item is automatically focused and set to editing mode.
     * After the editing (naming of the item) is done, this function is called.
     * If the label is empty, meaning the user didn't give a name to the item, we want to remove it to the tree.
     * If it is not empty, we want to update the tree (with the new item)
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
            const parentFolderSearchResult: ITreeSearchResult = searchTree(
                treeItemsCopy,
                itemToRemove.parentFolderId ?? ""
            );
            const parentFolder = parentFolderSearchResult.treeItem;

            parentFolder?.items?.splice(itemToRemoveSearchResult.index, 1);
            handleTreeItemClick(parentFolder);
        } else {
            treeItemsCopy.splice(itemToRemoveSearchResult.index, 1);
            handleTreeItemClick(undefined);
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

    const handleTreeItemClick = (treeItem: ITreeItem) => {
        setSelectedTreeItem(treeItem);
        focusedTreeItemRef.current = treeItem;
    };

    const handleFocusTreeItem = (treeItem: ITreeItem) => {
        treeItem?.itemType === ETreeItemType.Folder &&
            getFolderRef(treeItem.id)?.focus();
        treeItem?.itemType === ETreeItemType.FolderItem &&
            getFolderItemRef(treeItem.id)?.focus();

        focusedTreeItemRef.current = treeItem;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
                {
                    if (!traversedAndSortedTreeMemo) return;

                    const isDirectionUp = e.key === "ArrowUp";
                    const isDirectionDown = e.key === "ArrowDown";
                    const focusedTreeItemIndex =
                        traversedAndSortedTreeMemo.findIndex(
                            (treeItem) =>
                                treeItem.id === focusedTreeItemRef.current?.id
                        );

                    if (isDirectionUp && focusedTreeItemIndex === 0) {
                        // Our focused item is the first item of the tree, we can't go higher.
                        return;
                    }
                    if (
                        isDirectionDown &&
                        focusedTreeItemIndex ===
                            traversedAndSortedTreeMemo.length - 1
                    ) {
                        // Our focused item is the last item of the tree, we can't go lower.
                        return;
                    }

                    const nextItemIndex = isDirectionUp
                        ? focusedTreeItemIndex - 1
                        : focusedTreeItemIndex + 1;

                    /**
                     * At this point, our focused item is either our second or second last item in our folder tree.
                     * We need to:
                     * 1. Loop through our items
                     * 2. Determine if our next item is hidden (in a closed folder) or not
                     * 3. Focus the next item if it's visible
                     */

                    for (
                        let i = nextItemIndex;
                        isDirectionUp
                            ? i >= 0
                            : i < traversedAndSortedTreeMemo.length;
                        isDirectionUp ? i-- : i++
                    ) {
                        const nextItem = traversedAndSortedTreeMemo[i];
                        const nextItemHasParentFolder =
                            nextItem.parentFolderId?.length;

                        if (!nextItemHasParentFolder) {
                            handleFocusTreeItem(nextItem);
                            break;
                        }

                        const nextItemParentFolder =
                            traversedAndSortedTreeMemo.find(
                                (treeItem) =>
                                    treeItem.id === nextItem.parentFolderId
                            );
                        const isNextItemParentFolderOpen = getFolderRef(
                            nextItemParentFolder.id
                        )?.isFolderOpen();

                        if (isNextItemParentFolderOpen) {
                            handleFocusTreeItem(nextItem);
                            break;
                        }
                    }
                }
                break;
            case "ArrowLeft":
            case "ArrowRight":
                {
                    if (
                        !focusedTreeItemRef.current ||
                        focusedTreeItemRef.current?.itemType ===
                            ETreeItemType.FolderItem
                    ) {
                        return;
                    }

                    const folderRef = getFolderRef(
                        focusedTreeItemRef.current?.id
                    );
                    folderRef && e.key === "ArrowLeft"
                        ? folderRef.closeFolder()
                        : folderRef.openFolder();
                }
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

    const renderTree = (treeItems: ITreeItem[]) => {
        return treeItems.map((treeItem) => {
            const isFolderItem = treeItem.itemType === ETreeItemType.FolderItem;
            const isFolder = treeItem.itemType === ETreeItemType.Folder;

            if (isFolderItem) {
                // If we have a treeItem of type folderItem and it's depth is 0, add it to the root of the folder tree
                return getTreeItemElement(treeItem);
            } else if (isFolder) {
                // If we have a treeItem of type folder, we need to render all it's items.
                if (!treeItem.items || !treeItem.items.length) {
                    // If the folder doesn't have any items, simply add it the the folder tree
                    return getTreeItemElement(treeItem);
                } else {
                    // We need to get all of the folder items
                    const folderItems = renderTree(
                        treeItem.items
                    ) as JSX.Element[];
                    return getTreeItemElement(
                        treeItem,
                        folderItems as JSX.Element[]
                    );
                }
            }
        });
    };

    const getTreeItemElement = (
        treeItem: ITreeItem,
        children?: JSX.Element[]
    ) => {
        return treeItem.itemType === ETreeItemType.Folder ? (
            <Folder
                key={`${treeItem.id}-${treeItem.depth}`}
                ref={setFolderRefCallback(treeItem.id)}
                activeFolder={activeFolderMemo}
                ancestorFolderIds={treeItem.ancestorFolderIds}
                depth={treeItem.depth}
                hideInactiveBranchLine={!isTreeHovered}
                id={treeItem.id}
                isSelected={selectedTreeItem?.id === treeItem.id}
                label={treeItem.label}
                onFirstEditEnded={handleFirstEditEnded}
                onItemClick={() => {
                    handleTreeItemClick(treeItem);
                }}
                onLabelChanged={handleUpdateTreeItemLabel}
            >
                {children}
            </Folder>
        ) : (
            <FolderItem
                key={`${treeItem.id}-${treeItem.depth}`}
                ref={setFolderItemRefCallback(treeItem.id)}
                activeFolder={activeFolderMemo}
                ancestorFolderIds={treeItem.ancestorFolderIds}
                depth={treeItem.depth}
                hideInactiveBranchLine={!isTreeHovered}
                id={treeItem.id}
                isSelected={selectedTreeItem?.id === treeItem.id}
                label={treeItem.label}
                onFirstEditEnded={handleFirstEditEnded}
                onItemClick={() => {
                    handleTreeItemClick(treeItem);
                }}
                onLabelChanged={handleUpdateTreeItemLabel}
            />
        );
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
                onCollapseFolders={() =>
                    handleCollapseOrExpandFolders(treeItems, true)
                }
                onExpandFolders={() => {
                    handleCollapseOrExpandFolders(treeItems, false);
                    if (selectedTreeItem) {
                        if (
                            selectedTreeItem.itemType === ETreeItemType.Folder
                        ) {
                            getFolderRef(selectedTreeItem.id)?.scrollIntoView();
                        } else {
                            getFolderItemRef(
                                selectedTreeItem.id
                            )?.scrollIntoView();
                        }
                    }
                }}
            />
            {renderTree(treeItems)}
            <div
                role="Select root on click"
                style={{ height: "30px" }}
                onClick={() => setSelectedTreeItem(undefined)}
            />
        </div>
    );
}

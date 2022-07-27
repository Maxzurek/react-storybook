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
import {
    getSelectedBranchLineResult,
    searchTree,
    sortTreeItemsByRenderingOrder,
} from "./FolderTree.utils";

const rootFolderId = generateRandomId();
const firstItemId = generateRandomId();

const initialTreeItems: ITreeItem[] = [
    {
        id: rootFolderId,
        itemType: ETreeItemType.Folder,
        label: "RootFolder",
        depth: 0,
        items: [
            {
                id: firstItemId,
                itemType: ETreeItemType.FolderItem,
                label: "Item 1",
                depth: 1,
                parentFolderId: rootFolderId,
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
    const [focusedTreeItem, setFocusedTreeItem] = useState<ITreeItem>();
    const [isTreeHovered, setIsMoveEntered] = useState(false);

    const headerRef = useRef<FolderTreeHeaderRef>();

    const sortedTreeItemsByRenderingOrder = useMemo(
        () => sortTreeItemsByRenderingOrder(treeItems),
        [treeItems]
    );

    const handleCollapseFolders = (treeItems: ITreeItem[]) => {
        for (const treeItem of treeItems) {
            if (treeItem.itemType === ETreeItemType.Folder) {
                getFolderRef(treeItem.id)?.closeFolder();

                if (treeItem.items) {
                    handleCollapseFolders(treeItem.items);
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

        if (selectedTreeItem) {
            if (isSelectedItemFolder) {
                const parentFolder = searchTree(
                    treeItemCopy,
                    selectedTreeItem.id
                ).treeItem;
                parentFolder?.items?.push(newTreeItem);
            } else {
                const parentFolder = searchTree(
                    treeItemCopy,
                    selectedTreeItem.parentFolderId ?? ""
                ).treeItem;
                parentFolder?.items?.push(newTreeItem);
            }

            // If we have a selectedTreeItem and it is a folder, we need to open it to render our new treeItem
            isSelectedItemFolder &&
                getFolderRef(selectedTreeItem.id)?.openFolder();
        } else {
            treeItemCopy.push(newTreeItem);
        }

        // Our new treeItem needs to be rendered in order to focus it and set edit mode on
        flushSync(() => {
            handleTreeItemSelected(newTreeItem);
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

    const handleFirstEditEnded = (itemId: string, labelValue: string) => {
        if (!labelValue && !labelValue.length) {
            handleRemoveItem(itemId);
        } else {
            handleUpdateTreeItemLabel(itemId, labelValue);
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
            handleTreeItemSelected(parentFolder);
        } else {
            treeItemsCopy.splice(itemToRemoveSearchResult.index, 1);
            handleTreeItemSelected(undefined);
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

    const handleTreeItemSelected = (treeItem: ITreeItem) => {
        setSelectedTreeItem(treeItem);
        setFocusedTreeItem(treeItem);
    };

    const handleFocusTreeItem = (treeItem: ITreeItem) => {
        treeItem?.itemType === ETreeItemType.Folder &&
            getFolderRef(treeItem.id)?.focus();
        treeItem?.itemType === ETreeItemType.FolderItem &&
            getFolderItemRef(treeItem.id)?.focus();

        setFocusedTreeItem(treeItem);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
                {
                    if (!sortedTreeItemsByRenderingOrder) return;

                    const isDirectionUp = e.key === "ArrowUp";
                    const isDirectionDown = e.key === "ArrowDown";
                    const focusedTreeItemIndex =
                        sortedTreeItemsByRenderingOrder.findIndex(
                            (treeItem) => treeItem.id === focusedTreeItem.id
                        );

                    if (isDirectionUp && focusedTreeItemIndex === 0) {
                        // Our focused item is the first item of the tree, we can't go higher.
                        return;
                    }
                    if (
                        isDirectionDown &&
                        focusedTreeItemIndex ===
                            sortedTreeItemsByRenderingOrder.length - 1
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
                            : i < sortedTreeItemsByRenderingOrder.length;
                        isDirectionUp ? i-- : i++
                    ) {
                        const nextItem = sortedTreeItemsByRenderingOrder[i];
                        const nextItemHasParentFolder =
                            nextItem.parentFolderId?.length;

                        if (!nextItemHasParentFolder) {
                            handleFocusTreeItem(nextItem);
                            break;
                        }

                        const nextItemParentFolder =
                            sortedTreeItemsByRenderingOrder.find(
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
                        !focusedTreeItem ||
                        focusedTreeItem.itemType === ETreeItemType.FolderItem
                    ) {
                        return;
                    }

                    const folderRef = getFolderRef(focusedTreeItem.id);
                    folderRef && e.key === "ArrowLeft"
                        ? folderRef.closeFolder()
                        : folderRef.openFolder();
                }
                break;
            default:
                break;
        }
    };

    const renderTree = (treeItems: ITreeItem[]) => {
        return treeItems.map((treeItem) => {
            const isFolderItem = treeItem.itemType === ETreeItemType.FolderItem;
            const isFolder = treeItem.itemType === ETreeItemType.Folder;

            if (isFolderItem) {
                // If we have a treeItem of type folderItem and it's depth is 0, add it to the root of the folder tree
                return getFolderItemElement(treeItem);
            } else if (isFolder) {
                // If we have a treeItem of type folder, we need to render all it's items.
                if (!treeItem.items || !treeItem.items.length) {
                    // If the folder doesn't have any items, simply add it the the folder tree
                    return getFolderElement(treeItem);
                } else {
                    // We need to get all of the folder items
                    const folderItems = renderTree(
                        treeItem.items
                    ) as JSX.Element[];
                    return getFolderElement(
                        treeItem,
                        folderItems as JSX.Element[]
                    );
                }
            }
        });
    };

    const getFolderItemElement = (treeItem: ITreeItem) => {
        const branchLineResult = getSelectedBranchLineResult(
            treeItem,
            selectedTreeItem,
            sortedTreeItemsByRenderingOrder
        );

        return (
            <FolderItem
                key={`${treeItem.id}-${treeItem.depth}`}
                ref={setFolderItemRefCallback(treeItem.id)}
                depth={treeItem.depth}
                id={treeItem.id}
                isSelected={selectedTreeItem?.id === treeItem.id}
                label={treeItem.label}
                selectedParentFolderDepth={
                    branchLineResult.selectedBranchLineDept
                }
                showBranchLineOnTreeHover={isTreeHovered}
                onFirstEditEnded={handleFirstEditEnded}
                onItemSelected={() => {
                    handleTreeItemSelected(treeItem);
                }}
                onLabelChanged={handleUpdateTreeItemLabel}
            />
        );
    };

    const getFolderElement = (
        treeItem: ITreeItem,
        children?: JSX.Element[]
    ) => {
        const branchLineResult = getSelectedBranchLineResult(
            treeItem,
            selectedTreeItem,
            sortedTreeItemsByRenderingOrder
        );

        return (
            <Folder
                key={`${treeItem.id}-${treeItem.depth}`}
                ref={setFolderRefCallback(treeItem.id)}
                depth={treeItem.depth}
                id={treeItem.id}
                isSelected={selectedTreeItem?.id === treeItem.id}
                label={treeItem.label}
                selectedParentFolderDepth={
                    branchLineResult.selectedBranchLineDept
                }
                showBranchLineOnTreeHover={isTreeHovered}
                onFirstEditEnded={handleFirstEditEnded}
                onItemSelected={() => {
                    handleTreeItemSelected(treeItem);
                }}
                onLabelChanged={handleUpdateTreeItemLabel}
            >
                {children}
            </Folder>
        );
    };

    return (
        <div
            className="folder-tree"
            tabIndex={0}
            onKeyDownCapture={handleKeyDown}
            onMouseEnter={() => {
                headerRef.current?.setIsVisible(true);
                setIsMoveEntered(true);
            }}
            onMouseLeave={() => {
                headerRef.current?.setIsVisible(false);
                setIsMoveEntered(false);
            }}
        >
            <FolderTreeHeader
                ref={headerRef}
                onAddTreeItem={handleAddTreeItem}
                onClick={() => handleFocusTreeItem(undefined)}
                onCollapseFolders={() => handleCollapseFolders(treeItems)}
            />
            {renderTree(treeItems)}
        </div>
    );
}

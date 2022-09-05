import { useCallback, useRef, useState } from "react";
import { generateRandomId } from "../../../utilities/Math.utils";
import FolderTree, { FolderTreeRef } from "./FolderTree";
import FolderTreeHeader from "./FolderTreeHeader";
import { FolderTreeItem, TreeItemType } from "./TreeItem.interfaces";

const folderOneId = generateRandomId();
const folderTwoId = generateRandomId();
const firstItemId = generateRandomId();
const secondItemId = generateRandomId();
const thirdItemId = generateRandomId();
const initialTreeItems: FolderTreeItem[] = [
    {
        id: folderOneId,
        itemType: TreeItemType.Folder,
        label: "Folder 1",
        parentFolderId: undefined,
    },
    {
        id: folderTwoId,
        itemType: TreeItemType.Folder,
        label: "Folder 2",
        parentFolderId: folderOneId,
    },
    {
        id: firstItemId,
        itemType: TreeItemType.FolderItem,
        label: "Item 1 of Folder 1",
        parentFolderId: folderOneId,
    },
    {
        id: secondItemId,
        itemType: TreeItemType.FolderItem,
        label: "Item 2 of Folder 1",
        parentFolderId: folderOneId,
    },
    {
        id: thirdItemId,
        itemType: TreeItemType.FolderItem,
        label: "Item 1 of Folder 2",
        parentFolderId: folderTwoId,
    },
];

export default function FolderTreeIndex() {
    const [treeItems, setTreeItems] = useState(initialTreeItems);
    const [isFolderTreeHovered, setIsFolderTreeHovered] = useState(false);

    const folderTreeRef = useRef<FolderTreeRef>();
    const recentlyAddedItems = useRef<FolderTreeItem[]>([]);

    const handleCreateNewFolderTreeItem = useCallback(
        (treeItemType: TreeItemType, isSelectedItemFolder: boolean) => {
            const selectedTreeItem = folderTreeRef.current?.getSelectedTreeItem();
            const newItem: FolderTreeItem = {
                id: generateRandomId(),
                label: "",
                itemType: treeItemType,
                parentFolderId: undefined,
            };

            if (isSelectedItemFolder) {
                // We have a folder selected. Add the new item to it's items
                newItem.parentFolderId = selectedTreeItem.id;
            } else if (selectedTreeItem) {
                // We have FolderItem that is inside a folder. We need to get it's parent folder and add the new item to its items
                newItem.parentFolderId = selectedTreeItem.parentFolderId;
            }

            return newItem;
        },
        []
    );

    const handleAddTreeItem = useCallback(
        (treeItemType: TreeItemType) => {
            if (recentlyAddedItems.current?.length) {
                return;
            }

            const selectedTreeItem = folderTreeRef.current?.getSelectedTreeItem();
            const isSelectedItemFolder = selectedTreeItem?.itemType === TreeItemType.Folder;
            const newItem = handleCreateNewFolderTreeItem(treeItemType, isSelectedItemFolder);

            recentlyAddedItems.current?.push(newItem);
            setTreeItems((prev) => [...prev, newItem]);

            if (isSelectedItemFolder) {
                folderTreeRef.current?.openFolder(selectedTreeItem);
            }

            folderTreeRef.current?.setSelectedTreeItem(newItem);
            folderTreeRef.current?.setTreeItemInEditMode(newItem);
        },
        [handleCreateNewFolderTreeItem]
    );

    const handleRemoveTreeItem = (treeItemToRemove: FolderTreeItem) => {
        const treeItemsCopy = [...treeItems];
        const indexOfTreeItemToRemove = treeItemsCopy.findIndex(
            (treeItem) => treeItem.id === treeItemToRemove.id
        );

        treeItemsCopy.splice(indexOfTreeItemToRemove, 1);
        setTreeItems(treeItemsCopy);

        folderTreeRef.current?.focusTreeItemParentFolder(treeItemToRemove);
        folderTreeRef.current?.selectTreeItemParentFolder(treeItemToRemove);
    };

    const handleSelectAndFocusTreeItem = (treeItem: FolderTreeItem) => {
        folderTreeRef.current?.setSelectedTreeItem(treeItem);
        folderTreeRef.current?.setFocusedTreeItem(treeItem);
    };

    const handleCollapseFolders = useCallback(() => {
        folderTreeRef.current?.collapseAllFolders();
    }, []);

    const handleExpandFolders = useCallback(() => {
        folderTreeRef.current?.expandAllFolders();
    }, []);

    const handleScrollItemIntoViewSelectAndEdit = useCallback((treeItem: FolderTreeItem) => {
        folderTreeRef.current.scrollTreeItemIntoViewSelectAndEdit(treeItem.id, {
            behavior: "smooth",
        });
    }, []);

    const handleSetTreeItemInEditMode = () => {
        const focusedTreeItem = folderTreeRef.current?.getFocusedTreeItem();
        const selectedTreeItem = folderTreeRef.current?.getSelectedTreeItem();

        folderTreeRef.current?.setTreeItemInEditMode(focusedTreeItem || selectedTreeItem);
        handleSelectAndFocusTreeItem(focusedTreeItem || selectedTreeItem);
    };

    const handleTreeItemEditEnd = (treeItem: FolderTreeItem) => {
        if (recentlyAddedItems.current?.pop() && !treeItem.label) {
            handleRemoveTreeItem(treeItem);
        } else {
            handleUpdateTreeItem(treeItem);
        }
    };

    const handleUpdateTreeItem = (treeItemToUpdate: FolderTreeItem) => {
        const treeItemCopy = [...treeItems];
        const treeItemIndex = treeItemCopy.findIndex(
            (treeItem) => treeItem.id === treeItemToUpdate.id
        );

        if (treeItemIndex < 0) return;

        const treeItemBeforeUpdate = treeItemCopy[treeItemIndex];

        treeItemCopy[treeItemIndex] = treeItemToUpdate;
        setTreeItems(treeItemCopy);

        if (treeItemBeforeUpdate.label !== treeItemToUpdate.label) {
            folderTreeRef.current?.scrollTreeItemIntoView(treeItemToUpdate.id, {
                behavior: "smooth",
                block: "nearest",
            });
        }

        handleSelectAndFocusTreeItem(treeItemToUpdate);
    };

    const handleFolderTreeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                folderTreeRef.current?.focusPreviousTreeItem();
                break;
            case "ArrowDown":
                e.preventDefault();
                folderTreeRef.current?.focusNextTreeItem();
                break;
            case "ArrowLeft":
                folderTreeRef.current?.closeFocusedFolder();
                break;
            case "ArrowRight":
                folderTreeRef.current?.openFocusedFolder();
                break;
            case "F2":
                handleSetTreeItemInEditMode();
                break;
            case "Enter":
                folderTreeRef.current?.stopTreeItemInEditMode();
                break;
            case "Escape":
                e.preventDefault();
                e.stopPropagation();
                folderTreeRef.current?.cancelTreeItemInEditMode();
                break;
            default:
                break;
        }
    };

    const handleFolderTreeMouseEnter = () => {
        setIsFolderTreeHovered(true);
    };

    const handleFolderTreeMouseLeave = () => {
        setIsFolderTreeHovered(false);
    };

    return (
        <>
            <FolderTreeHeader
                showActionButtons={
                    isFolderTreeHovered || !!folderTreeRef.current?.getSelectedTreeItem()
                }
                treeItems={treeItems}
                onAddTreeItem={handleAddTreeItem}
                onCollapseFolders={handleCollapseFolders}
                onExpandFolders={handleExpandFolders}
                onScrollItemIntoViewAndEdit={handleScrollItemIntoViewSelectAndEdit}
            />
            <FolderTree
                ref={folderTreeRef}
                items={treeItems}
                showInactiveBranchLines={isFolderTreeHovered}
                onKeyDown={handleFolderTreeKeyDown}
                onMouseEnter={handleFolderTreeMouseEnter}
                onMouseLeave={handleFolderTreeMouseLeave}
                onTreeItemEditEnd={handleTreeItemEditEnd}
            />
        </>
    );
}

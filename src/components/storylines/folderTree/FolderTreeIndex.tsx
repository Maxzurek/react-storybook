import { useCallback, useMemo, useRef, useState } from "react";
import { generateRandomId } from "../../../utilities/Math.utils";
import StorybookContextMenu, { ContextMenuRef } from "../muiMenu/ContextMenu";
import StorybookMenuItem from "../muiMenu/MenuItem";
import FolderTree, { FolderTreeRef } from "./FolderTree";
import FolderTreeHeader from "./FolderTreeHeader";
import { FolderTreeItem, TreeItemType } from "./TreeItem.interfaces";

const folderOneId = generateRandomId();
const initialTreeItems: FolderTreeItem[] = [
    {
        id: folderOneId,
        itemType: TreeItemType.Folder,
        label: "New folder",
        parentFolderId: undefined,
    },
];

export default function FolderTreeIndex() {
    const [treeItems, setTreeItems] = useState(initialTreeItems);
    const [isFolderTreeHovered, setIsFolderTreeHovered] = useState(false);
    const [contextMenuItem, setContextMenuItem] = useState<FolderTreeItem>();

    const folderTreeRef = useRef<FolderTreeRef>();
    const recentlyAddedItems = useRef<FolderTreeItem[]>([]);
    const treeItemContextMenuRef = useRef<ContextMenuRef>();
    const folderTreeRootContextMenuRef = useRef<ContextMenuRef>();

    const isTouchDeviceMemo = useMemo(() => "ontouchstart" in window, []);

    const getFocusedOrSelectedTreeItem = () => {
        return (
            folderTreeRef.current?.getFocusedTreeItem() ||
            folderTreeRef.current?.getSelectedTreeItem()
        );
    };

    const handleCreateNewFolderTreeItem = useCallback(
        (treeItemType: TreeItemType, focusedTreeItem: FolderTreeItem) => {
            const newItem: FolderTreeItem = {
                id: generateRandomId(),
                label: "",
                itemType: treeItemType,
                parentFolderId: undefined,
            };

            if (focusedTreeItem?.itemType === TreeItemType.Folder) {
                // We have a folder selected. Add the new item to it's items
                newItem.parentFolderId = focusedTreeItem.id;
            } else if (focusedTreeItem) {
                // We have FolderItem that is inside a folder. We need to get it's parent folder and add the new item to its items
                newItem.parentFolderId = focusedTreeItem.parentFolderId;
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

            const focusedOrSelectedTreeItem = getFocusedOrSelectedTreeItem();
            const isSelectedItemFolder =
                focusedOrSelectedTreeItem?.itemType === TreeItemType.Folder;
            const newItem = handleCreateNewFolderTreeItem(treeItemType, focusedOrSelectedTreeItem);

            recentlyAddedItems.current?.push(newItem);
            setTreeItems((prev) => [...prev, newItem]);

            if (isSelectedItemFolder) {
                folderTreeRef.current?.openFolder(focusedOrSelectedTreeItem);
            }

            folderTreeRef.current?.setSelectedTreeItem(newItem);
            folderTreeRef.current?.focusTreeItem(newItem);
            folderTreeRef.current?.setTreeItemInEditMode(newItem);
        },
        [handleCreateNewFolderTreeItem]
    );

    const handleRemoveTreeItem = (treeItem?: FolderTreeItem) => {
        const treeItemToRemove = treeItem || getFocusedOrSelectedTreeItem();
        const treeItemsCopy = [...treeItems];
        const indexOfTreeItemToRemove = treeItemsCopy.findIndex(
            (ti) => ti.id === treeItemToRemove.id
        );

        treeItemsCopy.splice(indexOfTreeItemToRemove, 1);
        setTreeItems(treeItemsCopy);

        folderTreeRef.current?.focusTreeItemParentFolder(treeItemToRemove);
        folderTreeRef.current?.selectTreeItemParentFolder(treeItemToRemove);
    };

    const handleCollapseFolders = useCallback(() => {
        folderTreeRef.current?.collapseAllFolders();
    }, []);

    const handleExpandFolders = useCallback(() => {
        folderTreeRef.current?.expandAllFoldersSynchronously();
    }, []);

    const handleScrollItemIntoViewSelectAndEdit = useCallback((treeItem: FolderTreeItem) => {
        folderTreeRef.current.scrollTreeItemIntoViewSelectAndEdit(treeItem.id, {
            behavior: "smooth",
            block: "center",
        });
    }, []);

    const handleSetTreeItemInEditMode = () => {
        const focusedOrSelectedTreeItem = getFocusedOrSelectedTreeItem();

        folderTreeRef.current?.setTreeItemInEditMode(focusedOrSelectedTreeItem);
        folderTreeRef.current?.setSelectedTreeItem(focusedOrSelectedTreeItem);
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

        treeItemCopy.slice(treeItemIndex, 1);
        treeItemCopy[treeItemIndex] = { ...treeItemToUpdate };
        setTreeItems(treeItemCopy);

        folderTreeRef.current?.setSelectedTreeItem(treeItemToUpdate);
        folderTreeRef.current?.focusTreeItem(treeItemToUpdate, { preventScroll: true });
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
            case "Delete":
                handleRemoveTreeItem();
                break;
        }
    };

    const handleFolderTreeMouseEnter = () => {
        setIsFolderTreeHovered(true);
    };

    const handleFolderTreeMouseLeave = () => {
        setIsFolderTreeHovered(false);
    };

    const handleTreeItemContextMenu = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        treeItem: FolderTreeItem
    ) => {
        e.preventDefault();
        setContextMenuItem(treeItem);
        folderTreeRef.current?.setFocusedTreeItem(treeItem);
        treeItemContextMenuRef.current.open(e);
    };

    const handleFolderTreeRootContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        folderTreeRootContextMenuRef.current.open(e);
    };

    const handleContextMenuClosed = () => {
        folderTreeRef.current?.focusTreeItem(getFocusedOrSelectedTreeItem());
    };

    const handleContextMenuRename = () => {
        handleSetTreeItemInEditMode();
    };

    return (
        <>
            <FolderTreeHeader
                isTouchDevice={isTouchDeviceMemo}
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
                showInactiveBranchLines={isFolderTreeHovered || isTouchDeviceMemo}
                size={isTouchDeviceMemo ? "large" : "small"}
                treeItems={treeItems}
                onFolderTreeRootContextMenu={handleFolderTreeRootContextMenu}
                onKeyDown={handleFolderTreeKeyDown}
                onMouseEnter={handleFolderTreeMouseEnter}
                onMouseLeave={handleFolderTreeMouseLeave}
                onTreeItemContextMenu={handleTreeItemContextMenu}
                onTreeItemEditEnd={handleTreeItemEditEnd}
            />
            <StorybookContextMenu ref={treeItemContextMenuRef} onClose={handleContextMenuClosed}>
                {contextMenuItem?.itemType === TreeItemType.Folder && (
                    <>
                        <StorybookMenuItem
                            id="New file..."
                            title={"New file..."}
                            onClick={() => handleAddTreeItem(TreeItemType.FolderItem)}
                        />
                        <StorybookMenuItem
                            id="New folder..."
                            title={"New folder..."}
                            onClick={() => handleAddTreeItem(TreeItemType.Folder)}
                        />
                    </>
                )}
                <>
                    <StorybookMenuItem
                        id="Rename"
                        shortcut={isTouchDeviceMemo ? undefined : "F2"}
                        title={"Rename"}
                        withTopDivider={contextMenuItem?.itemType === TreeItemType.Folder}
                        onClick={handleContextMenuRename}
                    />
                    <StorybookMenuItem
                        id="Delete"
                        shortcut={isTouchDeviceMemo ? undefined : "Del"}
                        title={"Delete"}
                        onClick={() => handleRemoveTreeItem(contextMenuItem)}
                    />
                </>
            </StorybookContextMenu>
            <StorybookContextMenu ref={folderTreeRootContextMenuRef}>
                <>
                    <StorybookMenuItem
                        id="New file..."
                        title={"New file..."}
                        onClick={() => handleAddTreeItem(TreeItemType.FolderItem)}
                    />
                    <StorybookMenuItem
                        id="New folder..."
                        title={"New folder..."}
                        onClick={() => handleAddTreeItem(TreeItemType.Folder)}
                    />
                </>
            </StorybookContextMenu>
        </>
    );
}

import { useCallback, useMemo, useRef, useState } from "react";
import { generateRandomId } from "../../../utilities/Math.utils";
import StorybookContextMenu, { ContextMenuRef } from "../muiMenu/ContextMenu";
import StorybookMenuItem from "../muiMenu/MenuItem";
import FolderTree, { FolderTreeRef } from "./FolderTree";
import FolderTreeHeader from "./FolderTreeHeader";
import { FolderTreeItem, TreeItemType } from "./TreeItem.interfaces";
import { useFolderTree } from "./useFolderTree";

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
    const { folderTreeState, folderTreeDispatch } = useFolderTree(initialTreeItems);

    const [isFolderTreeHovered, setIsFolderTreeHovered] = useState(false);
    const [treeItemFromContextMenu, setTreeItemFromContextMenu] = useState<FolderTreeItem>();

    const folderTreeRef = useRef<FolderTreeRef>();
    const treeItemContextMenuRef = useRef<ContextMenuRef>();
    const folderTreeRootContextMenuRef = useRef<ContextMenuRef>();
    const recentlyAddedTreeItem = useRef<FolderTreeItem>();

    const isTouchDeviceMemo = useMemo(() => "ontouchstart" in window, []);

    const getFocusedOrSelectedTreeItem = () => {
        return folderTreeState.focusedTreeItem || folderTreeState.selectedTreeItem;
    };

    const handleAddTreeItem = useCallback(
        (treeItemType: TreeItemType) => {
            if (recentlyAddedTreeItem.current) return;

            const newItem: FolderTreeItem = {
                id: generateRandomId(),
                label: "",
                itemType: treeItemType,
                parentFolderId: undefined,
            };

            folderTreeDispatch({
                type: "addTreeItemToFocusedOrSelectedFolder",
                payload: newItem,
            });
            folderTreeDispatch({
                type: "setTreeItemInEditMode",
                payload: newItem,
            });
            folderTreeRef.current.focusTreeItemInput(newItem);
            recentlyAddedTreeItem.current = newItem;
        },
        [folderTreeDispatch]
    );

    const handleRemoveTreeItem = (treeItem?: FolderTreeItem) => {
        const treeItemToRemove = treeItem || getFocusedOrSelectedTreeItem();
        const treeItemParentFolder = folderTreeState.treeItemsMap.get(
            treeItemToRemove.parentFolderId
        );

        folderTreeDispatch({
            type: "removeTreeItem",
            payload: treeItemToRemove,
        });
        folderTreeDispatch({
            type: "setSelectedAndFocusedTreeItem",
            payload: treeItemParentFolder,
        });
        recentlyAddedTreeItem.current = null;
    };

    const handleCollapseFolders = useCallback(() => {
        folderTreeDispatch({ type: "expandAllFolders" });
    }, [folderTreeDispatch]);

    const handleExpandFolders = useCallback(() => {
        folderTreeDispatch({ type: "collapseAllFolders" });
    }, [folderTreeDispatch]);

    const handleScrollItemIntoViewAndEdit = useCallback(
        (treeItem: FolderTreeItem) => {
            folderTreeDispatch({ type: "expandTreeItemAncestorFolders", payload: treeItem });
            folderTreeDispatch({ type: "setTreeItemInEditMode", payload: treeItem });
            folderTreeRef.current.scrollTreeItemIntoView(treeItem, {
                behavior: "smooth",
                block: "center",
            });
        },
        [folderTreeDispatch]
    );

    const handleFolderTreeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
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
        setTreeItemFromContextMenu(treeItem);
        folderTreeRef.current?.focusTreeItemContainer(treeItem);
        treeItemContextMenuRef.current.open(e);
    };

    const handleFolderTreeRootContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        folderTreeRootContextMenuRef.current.open(e);
    };

    const handleContextMenuClosed = () => {
        folderTreeRef.current?.focusTreeItemContainer(getFocusedOrSelectedTreeItem());
    };

    const handleSetTreeItemInEditMode = () => {
        const focusedOrSelectedTreeItem =
            folderTreeState.focusedTreeItem || folderTreeState.selectedTreeItem;

        if (!focusedOrSelectedTreeItem) return;

        folderTreeDispatch({ type: "setTreeItemInEditMode", payload: focusedOrSelectedTreeItem });
    };

    const handleTreeItemEditEnd = (treeItem: FolderTreeItem) => {
        if (!treeItem.label) {
            const isFolder = treeItem.itemType === TreeItemType.Folder;
            treeItem.label = isFolder ? "New Folder" : "New Item";
        }

        folderTreeDispatch({ type: "updateTreeItem", payload: treeItem });
        folderTreeRef.current?.focusTreeItemContainer(treeItem);
        recentlyAddedTreeItem.current = null;
    };

    return (
        <>
            <FolderTreeHeader
                isTouchDevice={isTouchDeviceMemo}
                showActionButtons={isFolderTreeHovered || !!folderTreeState.selectedTreeItem}
                treeItems={folderTreeState.treeItems}
                onAddTreeItem={handleAddTreeItem}
                onCollapseFolders={handleCollapseFolders}
                onExpandFolders={handleExpandFolders}
                onScrollItemIntoViewAndEdit={handleScrollItemIntoViewAndEdit}
            />
            <FolderTree
                {...folderTreeState}
                ref={folderTreeRef}
                folderTreeDispatch={folderTreeDispatch}
                showInactiveDepthLines={isFolderTreeHovered || isTouchDeviceMemo}
                size={isTouchDeviceMemo ? "large" : "small"}
                onFolderTreeRootContextMenu={handleFolderTreeRootContextMenu}
                onKeyDown={handleFolderTreeKeyDown}
                onMouseEnter={handleFolderTreeMouseEnter}
                onMouseLeave={handleFolderTreeMouseLeave}
                onTreeItemContextMenu={handleTreeItemContextMenu}
                onTreeItemEditEnd={handleTreeItemEditEnd}
            />
            <StorybookContextMenu ref={treeItemContextMenuRef} onClose={handleContextMenuClosed}>
                {treeItemFromContextMenu?.itemType === TreeItemType.Folder && (
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
                        withTopDivider={treeItemFromContextMenu?.itemType === TreeItemType.Folder}
                        onClick={handleSetTreeItemInEditMode}
                    />
                    <StorybookMenuItem
                        id="Delete"
                        shortcut={isTouchDeviceMemo ? undefined : "Del"}
                        title={"Delete"}
                        onClick={() => handleRemoveTreeItem(treeItemFromContextMenu)}
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

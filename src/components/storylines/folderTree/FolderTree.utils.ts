import { TreeItemType, FolderTreeItem } from "./TreeItem.interfaces";

/**
 * Get the sorted and builded tree, which includes:
 * A hash map containing all the items of the tree;
 * An array containing all the items at the root of the tree. Items of type folder might have nested items;
 *  A sorted array containing all the items of the tree. Each items have their depth and ancestry defined;
 *
 * @param treeItems
 * @returns
 */
export const getSortedBuildedTree = (treeItems: FolderTreeItem[]) => {
    const sortedTreeItems = sortTreeItems(treeItems);
    const { treeItemsMap, rooTreeItemsWithNestedItems } = buildTree(sortedTreeItems);
    const sortedTreeItemsWithDepthAndAncestry = getTreeItemsWithDepthAndAncestry(
        rooTreeItemsWithNestedItems,
        treeItemsMap
    );

    return {
        treeItemsMap,
        rooTreeItemsWithNestedItems,
        sortedTreeItemsWithDepthAndAncestry,
    };
};

/**
 * Sort all the tree items.
 *
 * Items will be sorted in this order:
 * 1. Folder
 * 2. Folder item
 * 3. Label name ascending
 *
 * @param treeItems
 */
export const sortTreeItems = (
    treeItems: FolderTreeItem[],
    compareFn?: (a: FolderTreeItem, b: FolderTreeItem) => number
) => {
    if (compareFn) {
        treeItems.sort(compareFn);
    } else {
        treeItems.sort((a, b) => {
            const isAFolder = a.itemType === TreeItemType.Folder;
            const isBFolder = b.itemType === TreeItemType.Folder;
            const aLabelToLower = a.label?.toLowerCase();
            const bLabelToLower = b.label?.toLowerCase();

            if (isAFolder && !isBFolder) return -1;
            if (!isAFolder && isBFolder) return 1;
            // Now both items are the same type
            if (aLabelToLower < bLabelToLower) return -1;
            if (aLabelToLower > bLabelToLower) return 1;

            return 0;
        });
    }

    return treeItems;
};

export const buildTree = (treeItems: readonly FolderTreeItem[]) => {
    const treeItemsMap: Map<string, FolderTreeItem> = new Map();
    const rootItemIds: string[] = [];

    for (const treeItem of treeItems) {
        const treeItemCopy: FolderTreeItem = { ...treeItem };
        delete treeItemCopy.items; // Our tree might have been already build, we need to delete the items property to avoid duplicating it's value

        const existingTreeItemInMap = treeItemsMap.get(treeItemCopy.id);

        if (existingTreeItemInMap) {
            treeItemCopy.items = existingTreeItemInMap.items;
        }

        if (!treeItemCopy.parentFolderId) {
            // Our item is at the root of the tree
            treeItemsMap.set(treeItemCopy.id, treeItemCopy);
            rootItemIds.push(treeItemCopy.id);
        } else {
            // Our item is inside a folder

            // See if the parent folder previously added to the map
            const existingParentFolderItem = treeItemsMap.get(treeItemCopy.parentFolderId);

            if (!existingParentFolderItem) {
                // The parent folder was not added to the map. Create a new item and add it to the map.
                const newParentFolderItem: FolderTreeItem = {
                    id: treeItemCopy.parentFolderId,
                    itemType: TreeItemType.Folder,
                    label: "", // We don't know the folder yet. Set then label when we get to that item while iterating through the items provided as a parameter
                    parentFolderId: undefined,
                    items: [treeItemCopy],
                };
                treeItemsMap.set(newParentFolderItem.id, newParentFolderItem);
            } else {
                // The parent folder was previously added to the map. Simply push the item copy to it's items.
                existingParentFolderItem.items = existingParentFolderItem.items ?? [];
                existingParentFolderItem.items.push(treeItemCopy);
            }

            treeItemsMap.set(treeItemCopy.id, treeItemCopy);
        }
    }

    const rooTreeItemsWithNestedItems: FolderTreeItem[] = [];

    /**
     * Instead of iterating through our whole map to build our array of items (we only need the items at the root of our tree, all other items are already nested),
     * we get our items at the root and push it to the buildedTree array, reducing the time complexity.
     */
    for (const rooItemId of rootItemIds) {
        rooTreeItemsWithNestedItems.push(treeItemsMap.get(rooItemId));
    }

    return { treeItemsMap, rooTreeItemsWithNestedItems };
};

/**
 * Traverse all the nested tree items at the root of the tree.
 * The ancestorFolderIds as well as the depth of all items will be defined.
 *
 * @param rooTreeItemsWithNestedItems
 */
export const getTreeItemsWithDepthAndAncestry = (
    rooTreeItemsWithNestedItems: readonly FolderTreeItem[],
    treeItemsMap: Map<string, FolderTreeItem>,
    ancestorFolderIds?: string[],
    depth: number = null
) => {
    const traversedTree: FolderTreeItem[] = [];
    ancestorFolderIds = ancestorFolderIds ?? [];

    for (const treeItem of rooTreeItemsWithNestedItems) {
        const isFolderItem = treeItem.itemType === TreeItemType.FolderItem;
        const isFolder = treeItem.itemType === TreeItemType.Folder;

        treeItem.depth = depth ?? 0;

        if (isFolderItem) {
            // If we have a treeItem of type folderItem, simply add it to traversedTree array
            treeItem.ancestorFolderIds = [...ancestorFolderIds];
            treeItemsMap.set(treeItem.id, treeItem);
            traversedTree.push(treeItem);
        } else if (isFolder) {
            // If we have a treeItem of type folder, we need to get all it's items.
            if (!treeItem.items || !treeItem.items.length) {
                // If the folder doesn't have any items, simply add it the the folder tree
                treeItem.ancestorFolderIds = [...ancestorFolderIds];
                treeItemsMap.set(treeItem.id, treeItem);
                traversedTree.push(treeItem);
            } else {
                ancestorFolderIds = [...ancestorFolderIds, treeItem.id];

                // We need to get all the folder's items
                const folderItems = getTreeItemsWithDepthAndAncestry(
                    treeItem.items,
                    treeItemsMap,
                    ancestorFolderIds,
                    depth + 1
                );

                ancestorFolderIds.pop();
                treeItem.ancestorFolderIds = [...ancestorFolderIds];
                treeItemsMap.set(treeItem.id, treeItem);
                traversedTree.push(...[treeItem, ...folderItems]);
            }
        }
    }

    return traversedTree;
};

/**
 * If the treeItem is a folder an it is opened,
 * the openedParentFolderOfActiveGroup is the treeItem itself.
 *
 * If the treeItem is a folder and it is closed,
 * the openedParentFolderOfActiveGroup would be the closest ancestor folder of the tree item that is opened.
 *
 * If the selected item is a FolderItem, the openedParentFolderOfActiveGroup is the parent folder of the selected item.
 *
 * @param treeItem
 * @param sortedTreeItemsWithDepthAndAncestry
 * @param openedFolders
 * @returns
 */
export const getOpenedParentFolderOfActiveGroup = (
    treeItem: FolderTreeItem,
    sortedTreeItemsWithDepthAndAncestry: FolderTreeItem[],
    openedFolders: Map<string, FolderTreeItem>
) => {
    if (!treeItem) {
        return null;
    }

    if (treeItem.itemType === TreeItemType.Folder) {
        const isFolderOpen = openedFolders.get(treeItem.id) != null;

        if (isFolderOpen) {
            return treeItem;
        } else if (!treeItem.parentFolderId) {
            return null;
        } else if (!treeItem.ancestorFolderIds) {
            return sortedTreeItemsWithDepthAndAncestry.find(
                (ti) => ti.parentFolderId === treeItem.parentFolderId
            );
        } else {
            // Our items are sorted, iterate through them backward so we can find the closest opened ancestor folder
            for (let i = treeItem.ancestorFolderIds.length - 1; i >= 0; i--) {
                const ancestorFolderId = treeItem.ancestorFolderIds[i];

                const isAncestorFolderOpen = openedFolders.get(ancestorFolderId) != null;

                if (isAncestorFolderOpen) {
                    return sortedTreeItemsWithDepthAndAncestry.find(
                        (ti) => ti.id === ancestorFolderId
                    );
                }
            }
        }
    } else {
        return sortedTreeItemsWithDepthAndAncestry.find((ti) => ti.id === treeItem.parentFolderId);
    }
};

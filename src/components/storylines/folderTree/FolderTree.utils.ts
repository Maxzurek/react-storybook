import {
    TreeItemType,
    ITreeItem,
    TreeSearchResult,
} from "./TreeItem.interfaces";

/**
 * Search a folder tree items.
 *
 * If found, will return a ITreeSearchResult containing the TreeItem found
 * as well as his index position inside it's parent folder
 *
 * @param treeItems
 * @param itemIdToFind
 */
export const searchTree = (
    treeItems: ITreeItem[],
    itemIdToFind: string | undefined
): TreeSearchResult | undefined => {
    for (let index = 0; index < treeItems.length; index++) {
        const treeItem = treeItems[index];
        if (treeItem.id === itemIdToFind) return { treeItem, index };

        if (treeItem.items) {
            const searchResult = searchTree(treeItem.items, itemIdToFind);
            if (searchResult) return searchResult;
        }
    }

    return undefined;
};

/**
 * Sort tree items.
 *
 * Items will be sorted in this order:
 * 1. Folder
 * 2. Folder item
 * 3. Label name ascending
 *
 * @param treeItems
 */
export const sortFolderTree = (treeItems: ITreeItem[]) => {
    treeItems.sort((a, b) => {
        const isAFolder = a.itemType === TreeItemType.Folder;
        const isBFolder = b.itemType === TreeItemType.Folder;
        const aLabelToLower = a.label.toLowerCase();
        const bLabelToLower = b.label.toLowerCase();

        if (isAFolder && !isBFolder) return -1;
        if (!isAFolder && isBFolder) return 1;
        // Now both items are the same type
        if (aLabelToLower < bLabelToLower) return -1;
        if (aLabelToLower > bLabelToLower) return 1;

        return 0;
    });

    return treeItems;
};

/**
 * Traverse and sort all tree items.
 *
 * Items will be sorted in this order:
 * 1. Folder
 * 2. Folder item
 * 3. Label name ascending
 *
 * This function also sets the ancestorFolderId of all items when traversing the tree.
 *
 * @param treeItems
 * @returns ITreeItem[] sorted by their rendering order
 */
export const getTraversedAndSortedTree = (
    treeItems: ITreeItem[],
    ancestorsFolderId?: string[],
    depth: number = null
) => {
    sortFolderTree(treeItems);

    const traversedAndSortedTree = [];
    ancestorsFolderId = ancestorsFolderId ?? [];

    for (const sortedTreeItem of treeItems) {
        const isFolderItem =
            sortedTreeItem.itemType === TreeItemType.FolderItem;
        const isFolder =
            sortedTreeItem.itemType === TreeItemType.Folder ||
            sortedTreeItem.itemType === TreeItemType.RootFolder;

        sortedTreeItem.depth = depth;

        if (isFolderItem) {
            // If we have a treeItem of type folderItem, simply add it to the sorted tree array
            sortedTreeItem.ancestorFolderIds = [...ancestorsFolderId];
            traversedAndSortedTree.push(sortedTreeItem);
        } else if (isFolder) {
            // If we have a treeItem of type folder, we need to get all it's items.
            if (!sortedTreeItem.items || !sortedTreeItem.items.length) {
                // If the folder doesn't have any items, simply add it the the folder tree
                sortedTreeItem.ancestorFolderIds = [...ancestorsFolderId];
                traversedAndSortedTree.push(sortedTreeItem);
            } else {
                ancestorsFolderId = [...ancestorsFolderId, sortedTreeItem.id];

                // We need to get all of the folder items
                const folderItems = getTraversedAndSortedTree(
                    sortedTreeItem.items,
                    ancestorsFolderId,
                    depth == null ? 0 : depth + 1 // If our depth is null, we are at the root of our tree. Our next items must have a depth of 0
                ) as ITreeItem[];

                ancestorsFolderId.pop();
                sortedTreeItem.ancestorFolderIds = [...ancestorsFolderId];
                traversedAndSortedTree.push(
                    ...[sortedTreeItem, ...folderItems]
                );
            }
        }
    }

    return traversedAndSortedTree;
};

export const isElementInViewPort = (element: HTMLElement) => {
    const top = element.getBoundingClientRect().top;
    return top >= 0 && top <= window.innerHeight;
};

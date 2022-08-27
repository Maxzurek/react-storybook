import { generateRandomId } from "../../../utilities/Math.utils";
import {
    TreeItemType,
    ITreeItem,
    TreeSearchResult,
} from "./TreeItem.interfaces";

export const rootFolderId = "folder-tree-root-folder";
const folderOneId = generateRandomId();
const firstItemId = generateRandomId();
export const initialTreeItems: ITreeItem[] = [
    {
        id: rootFolderId,
        itemType: TreeItemType.RootFolder,
        label: "rootFolderId",
        items: [
            {
                id: folderOneId,
                itemType: TreeItemType.Folder,
                label: "Folder 1",
                parentFolderId: rootFolderId,
                items: [
                    {
                        id: firstItemId,
                        itemType: TreeItemType.FolderItem,
                        label: "Item 1",
                        parentFolderId: folderOneId,
                    },
                ],
            },
        ],
    },
];

export const createBaseTreeItem = (): ITreeItem => {
    return {
        id: generateRandomId(),
        depth: undefined,
        itemType: undefined,
        label: "",
        parentFolderId: "",
        items: undefined,
    };
};

export const createTreeItem = (
    treeItemType: TreeItemType,
    selectedTreeItem: ITreeItem
) => {
    let newTreeItem = createBaseTreeItem();
    const isNewItemFolder = treeItemType === TreeItemType.Folder;
    const isSelectedItemFolder =
        selectedTreeItem?.itemType === TreeItemType.Folder;

    newTreeItem = {
        ...newTreeItem,
        depth: !selectedTreeItem
            ? 0 // No treeItem selected, we are at the root of our folder tree
            : isSelectedItemFolder
            ? selectedTreeItem.depth + 1
            : selectedTreeItem.depth,
        itemType: treeItemType,
        parentFolderId: !selectedTreeItem
            ? rootFolderId // No treeItem selected, we want to add the bew item to the root of our tree
            : isSelectedItemFolder
            ? selectedTreeItem.id
            : selectedTreeItem?.parentFolderId,
        items: isNewItemFolder ? [] : undefined,
    };

    return newTreeItem;
};

/**
 * Search a folder tree items.
 *
 * If found, will return a ITreeSearchResult containing the TreeItem found
 * as well as his index position inside it's parent folder.
 * Returns undefined if the item was not found.
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

    for (const treeItem of treeItems) {
        const isFolderItem = treeItem.itemType === TreeItemType.FolderItem;
        const isFolder =
            treeItem.itemType === TreeItemType.Folder ||
            treeItem.itemType === TreeItemType.RootFolder;

        treeItem.depth = depth;

        if (isFolderItem) {
            // If we have a treeItem of type folderItem, simply add it to the sorted tree array
            treeItem.ancestorFolderIds = [...ancestorsFolderId];
            traversedAndSortedTree.push(treeItem);
        } else if (isFolder) {
            // If we have a treeItem of type folder, we need to get all it's items.
            if (!treeItem.items || !treeItem.items.length) {
                // If the folder doesn't have any items, simply add it the the folder tree
                treeItem.ancestorFolderIds = [...ancestorsFolderId];
                traversedAndSortedTree.push(treeItem);
            } else {
                ancestorsFolderId = [...ancestorsFolderId, treeItem.id];

                // We need to get all of the folder items
                const folderItems = getTraversedAndSortedTree(
                    treeItem.items,
                    ancestorsFolderId,
                    depth == null ? 0 : depth + 1 // If our depth is null, we are at the root of our tree. Our next items must have a depth of 0
                ) as ITreeItem[];

                ancestorsFolderId.pop();
                treeItem.ancestorFolderIds = [...ancestorsFolderId];
                traversedAndSortedTree.push(...[treeItem, ...folderItems]);
            }
        }
    }

    return traversedAndSortedTree;
};

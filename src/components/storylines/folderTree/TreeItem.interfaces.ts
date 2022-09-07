export enum TreeItemType {
    Folder,
    FolderItem,
}

export interface FolderTreeItem {
    id: string;
    /**
     * The type of the item, can either be a Folder or a FolderItem
     */
    itemType: TreeItemType;
    /**
     * The item's parent folder Id.
     * Can be undefined if the item is at the root of the tree
     */
    parentFolderId: string | undefined;
    /**
     * The text to display
     */
    label: string;
    /**
     * Ids of all the ancestor's folders of the TreeItem.
     */
    ancestorFolderIds?: string[];
    /**
     * Will determine the depth of the item. Margin will be applied on the left of the line (even if it is hidden).
     * A value of 0 means the tree item is at the root of the folder tree.
     */
    depth?: number;
    /**
     * Nested items of the TreeItem
     */
    items?: FolderTreeItem[];
}

export type FolderTreeSize = "small" | "medium" | "large";

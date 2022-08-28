export enum TreeItemType {
    Folder,
    FolderItem,
}

export interface ITreeItem {
    id: string;
    itemType: TreeItemType;
    label: string;
    depth?: number;
    ancestorFolderIds?: string[];
    parentFolderId?: string;
    items?: ITreeItem[];
}

export interface TreeSearchResult {
    treeItem: ITreeItem | undefined;
    /**
     * Index position of the treeItem inside it's parent folder.
     */
    index: number;
}

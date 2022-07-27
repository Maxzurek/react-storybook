export enum ETreeItemType {
    Folder,
    FolderItem,
}

export interface ITreeItem {
    id: string;
    itemType: ETreeItemType;
    depth: number;
    label: string;
    ancestorFolderIds?: string[];
    parentFolderId?: string;
    items?: ITreeItem[];
}

export interface ITreeSearchResult {
    treeItem: ITreeItem | undefined;
    /**
     * Index position of the treeItem inside it's parent folder.
     */
    index: number;
}

export interface ITreeItemAncestry {
    isDescendantOfSelectedItem: boolean;
    selectedItemBranchLineDept?: number;
}

export enum ETreeItemType {
    Folder,
    FolderItem,
}

export interface ITreeItem {
    id: string;
    itemType: ETreeItemType;
    depth: number;
    label: string;
    ancestorsFolderId?: string[];
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

export interface ISelectedBranchLineResult {
    isSameBranchLineAsSelected: boolean;
    selectedBranchLineDept?: number;
}

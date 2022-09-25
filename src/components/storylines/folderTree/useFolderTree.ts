import { useEffect, useReducer } from "react";
import { getOpenedParentFolderOfActiveGroup, getSortedBuildedTree } from "./FolderTree.utils";
import { FolderTreeItem, TreeItemType } from "./TreeItem.interfaces";

export interface FolderTreeState {
    treeItems: FolderTreeItem[];
    treeItemsMap: Map<string, FolderTreeItem>;
    rootTreeItemsWithNestedItems: FolderTreeItem[];
    sortedTreeItemsWithDepthAndAncestry: FolderTreeItem[];
    selectedTreeItem: FolderTreeItem;
    focusedTreeItem: FolderTreeItem;
    treeItemInEditMode: FolderTreeItem;
    treeItemInEditModeInputValue: string;
    expandedFoldersMap: Map<string, FolderTreeItem>;
    openedParentFolderOfActiveGroup: FolderTreeItem;
}

export const initialFolderTreeState: FolderTreeState = {
    treeItems: [],
    treeItemsMap: new Map<string, FolderTreeItem>(),
    rootTreeItemsWithNestedItems: [],
    sortedTreeItemsWithDepthAndAncestry: [],
    selectedTreeItem: null,
    focusedTreeItem: null,
    treeItemInEditMode: null,
    treeItemInEditModeInputValue: "",
    expandedFoldersMap: new Map<string, FolderTreeItem>(),
    openedParentFolderOfActiveGroup: null,
};

export type FolderTreeAction =
    | {
          type: "setTreeItems";
          payload: FolderTreeItem[];
      }
    | {
          type: "addTreeItem";
          payload: FolderTreeItem;
      }
    | {
          type: "updateTreeItem";
          payload: FolderTreeItem;
      }
    | {
          type: "removeTreeItem";
          payload: FolderTreeItem;
      }
    | {
          type: "addTreeItemToFocusedOrSelectedFolder";
          payload: FolderTreeItem;
      }
    | {
          type: "setSelectedTreeItem";
          payload: FolderTreeItem;
      }
    | {
          type: "setFocusedTreeItem";
          payload: FolderTreeItem;
      }
    | {
          type: "setSelectedAndFocusedTreeItem";
          payload: FolderTreeItem;
      }
    | {
          type: "expandFolder";
          payload: FolderTreeItem;
      }
    | {
          type: "collapseFolder";
          payload: FolderTreeItem;
      }
    | {
          type: "expandTreeItemAncestorFolders";
          payload: FolderTreeItem;
      }
    | {
          type: "expandAllFolders";
      }
    | {
          type: "collapseAllFolders";
      }
    | {
          type: "setTreeItemInEditMode";
          payload: FolderTreeItem;
      }
    | {
          type: "setTreeItemInEditModeInputValue";
          payload: string;
      }
    | {
          type: "setOpenedParentFolderOfActiveGroup";
          payload: FolderTreeItem;
      };

export type FolderTreeReducer = (state: FolderTreeState, action: FolderTreeAction) => void;

export type FolderTreeStateReducer = {
    folderTreeState: FolderTreeState;
    folderTreeDispatch: React.Dispatch<FolderTreeAction>;
};

const folderTreeReducer = (state: FolderTreeState, action: FolderTreeAction): FolderTreeState => {
    switch (action.type) {
        case "setTreeItems": {
            const treeItems = action.payload;
            const sortedBuildedTree = getSortedBuildedTree(action.payload);

            return {
                ...state,
                ...sortedBuildedTree,
                treeItems,
            };
        }
        case "addTreeItem": {
            const itemToAdd = action.payload;

            if (!itemToAdd) return { ...state };

            const isItemFolder = itemToAdd.itemType === TreeItemType.Folder;
            const treeItemsCopy = [...state.treeItems];

            treeItemsCopy.push(action.payload);

            const sortedBuildedTree = getSortedBuildedTree(treeItemsCopy);
            const { treeItemsMap, sortedTreeItemsWithDepthAndAncestry } = sortedBuildedTree;

            if (isItemFolder) {
                state.expandedFoldersMap.set(itemToAdd.id, itemToAdd);
            }

            return {
                ...state,
                ...sortedBuildedTree,
                treeItems: treeItemsCopy,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    treeItemsMap.get(itemToAdd.id),
                    sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "updateTreeItem": {
            const treeItemToUpdate = action.payload;

            if (!treeItemToUpdate) return { ...state };

            const treeItemsCopy = state.treeItems.map((treeItem) => {
                if (treeItem.id !== treeItemToUpdate.id) {
                    return treeItem;
                } else {
                    return treeItemToUpdate;
                }
            });

            const sortedBuildedTree = getSortedBuildedTree(treeItemsCopy);
            const { treeItemsMap, sortedTreeItemsWithDepthAndAncestry } = sortedBuildedTree;

            return {
                ...state,
                ...sortedBuildedTree,
                treeItems: treeItemsCopy,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    treeItemsMap.get(treeItemToUpdate.id),
                    sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "removeTreeItem": {
            const treeItemToRemove = action.payload;

            if (!treeItemToRemove) return { ...state };

            const treeItemParentFolder = state.treeItemsMap.get(treeItemToRemove.parentFolderId);
            const treeItemsCopy = state.treeItems.filter(
                (treeItem) => treeItem.id !== treeItemToRemove.id
            );
            const sortedBuildedTree = getSortedBuildedTree(treeItemsCopy);
            const { treeItemsMap, sortedTreeItemsWithDepthAndAncestry } = sortedBuildedTree;

            return {
                ...state,
                ...sortedBuildedTree,
                treeItems: treeItemsCopy,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    treeItemsMap.get(treeItemParentFolder?.id),
                    sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "addTreeItemToFocusedOrSelectedFolder": {
            const itemToAdd = action.payload;

            if (!itemToAdd) return { ...state };

            const focusedOrSelectedTreeItem = state.focusedTreeItem || state.selectedTreeItem;
            const isSelectedItemFolder =
                focusedOrSelectedTreeItem?.itemType === TreeItemType.Folder;

            if (focusedOrSelectedTreeItem?.itemType === TreeItemType.Folder) {
                // We have a folder selected. Add the new item to it's items
                itemToAdd.parentFolderId = focusedOrSelectedTreeItem.id;
            } else if (focusedOrSelectedTreeItem) {
                // We have FolderItem that is inside a folder. We need to get it's parent folder and add the new item to its items
                itemToAdd.parentFolderId = focusedOrSelectedTreeItem.parentFolderId;
            }

            const treeItemsCopy = [...state.treeItems];
            treeItemsCopy.push(itemToAdd);

            const sortedBuildedTree = getSortedBuildedTree(treeItemsCopy);
            const { treeItemsMap, sortedTreeItemsWithDepthAndAncestry } = sortedBuildedTree;

            if (isSelectedItemFolder) {
                state.expandedFoldersMap.set(
                    focusedOrSelectedTreeItem.id,
                    focusedOrSelectedTreeItem
                );
            }

            return {
                ...state,
                ...sortedBuildedTree,
                treeItems: treeItemsCopy,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    treeItemsMap.get(itemToAdd.id),
                    sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "setSelectedTreeItem": {
            const treeItemToSelect = action.payload;

            return {
                ...state,
                selectedTreeItem: treeItemToSelect,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    state.treeItemsMap.get(treeItemToSelect?.id),
                    state.sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "setFocusedTreeItem": {
            const treeItemToFocus = action.payload;

            return {
                ...state,
                focusedTreeItem: treeItemToFocus,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    state.treeItemsMap.get(treeItemToFocus?.id),
                    state.sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "setSelectedAndFocusedTreeItem": {
            const treeItemToFocusAndSelect = action.payload;

            return {
                ...state,
                focusedTreeItem: treeItemToFocusAndSelect,
                selectedTreeItem: treeItemToFocusAndSelect,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    state.treeItemsMap.get(treeItemToFocusAndSelect?.id),
                    state.sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "expandFolder": {
            const folderToExpand = action.payload;

            if (folderToExpand?.itemType !== TreeItemType.Folder) return { ...state };

            state.expandedFoldersMap.set(folderToExpand.id, folderToExpand);

            return {
                ...state,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    state.treeItemsMap.get(folderToExpand.id),
                    state.sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "collapseFolder": {
            const folderToCollapse = action.payload;

            if (folderToCollapse?.itemType !== TreeItemType.Folder) return { ...state };

            state.expandedFoldersMap.delete(folderToCollapse.id);

            return {
                ...state,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    state.treeItemsMap.get(folderToCollapse.id),
                    state.sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "expandTreeItemAncestorFolders": {
            const treeItem = action.payload;
            const treeItemWithAncestry = state.treeItemsMap.get(treeItem?.id);
            const treeItemAncestorFolderIds = treeItemWithAncestry?.ancestorFolderIds;

            if (!treeItemAncestorFolderIds) return { ...state };

            for (const ancestorFolderId of treeItemAncestorFolderIds) {
                state.expandedFoldersMap.set(
                    ancestorFolderId,
                    state.treeItemsMap.get(ancestorFolderId)
                );
            }

            return {
                ...state,
            };
        }
        case "expandAllFolders": {
            const expandedFoldersMap = new Map<string, FolderTreeItem>();

            for (const treeItem of state.sortedTreeItemsWithDepthAndAncestry) {
                const isItemFolder = treeItem.itemType === TreeItemType.Folder;

                if (isItemFolder) {
                    expandedFoldersMap.set(treeItem.id, treeItem);
                }
            }

            return {
                ...state,
                expandedFoldersMap,
            };
        }
        case "collapseAllFolders": {
            return {
                ...state,
                expandedFoldersMap: new Map<string, FolderTreeItem>(),
            };
        }
        case "setTreeItemInEditMode": {
            const treeItemToSetInEditMode = action.payload;

            return {
                ...state,
                selectedTreeItem: treeItemToSetInEditMode,
                focusedTreeItem: treeItemToSetInEditMode,
                treeItemInEditMode: treeItemToSetInEditMode,
                openedParentFolderOfActiveGroup: getOpenedParentFolderOfActiveGroup(
                    state.treeItemsMap.get(treeItemToSetInEditMode?.id),
                    state.sortedTreeItemsWithDepthAndAncestry,
                    state.expandedFoldersMap
                ),
            };
        }
        case "setTreeItemInEditModeInputValue": {
            const treeItemInEditModeInputValue = action.payload;

            return {
                ...state,
                treeItemInEditModeInputValue,
            };
        }
        case "setOpenedParentFolderOfActiveGroup": {
            const openedParentFolderOfActiveGroup = action.payload;

            return {
                ...state,
                openedParentFolderOfActiveGroup,
            };
        }
        default: {
            throw new Error(`Unsupported type: ${(action as FolderTreeAction).type}`);
        }
    }
};

const useFolderTree = (
    initialTreeItems: FolderTreeItem[] = [],
    reducer = folderTreeReducer
): FolderTreeStateReducer => {
    const [folderTreeState, folderTreeDispatch] = useReducer(reducer, {
        ...initialFolderTreeState,
        treeItems: initialTreeItems,
    });

    /**
     * Setting the treeItems once will let our tree get builded with all the items have their depth and ancestry
     */
    useEffect(() => {
        folderTreeDispatch({ type: "setTreeItems", payload: initialTreeItems });
    }, [initialTreeItems]);

    return { folderTreeState, folderTreeDispatch };
};

export { useFolderTree, folderTreeReducer };

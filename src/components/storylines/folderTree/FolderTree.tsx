import "./FolderTree.scss";

import Folder, { FolderRef } from "./Folder";
import FolderItem from "./FolderItem";
import { TreeItemType, FolderTreeItem, FolderTreeSize } from "./TreeItem.interfaces";
import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import useRefCallback from "../../../hooks/useRefCallback";
import { getTraversedTree, buildTree, sortTreeItems } from "./FolderTree.utils";
import { TreeItemProps, TreeItemRef } from "./TreeItem";
import { flushSync } from "react-dom";

export interface FolderTreeRef {
    getSelectedTreeItem: () => FolderTreeItem;
    setSelectedTreeItem: (treeItem: FolderTreeItem) => void;
    selectTreeItemParentFolder: (treeItem: FolderTreeItem) => void;
    getFocusedTreeItem: () => FolderTreeItem;
    setFocusedTreeItem: (treeItem: FolderTreeItem) => void;
    focusTreeItem: (treeItem: FolderTreeItem, options?: FocusOptions) => void;
    openFolder: (treeItem: FolderTreeItem) => void;
    closeFolder: (treeItem: FolderTreeItem) => void;
    openFocusedFolder: () => void;
    closeFocusedFolder: () => void;
    collapseAllFolders: () => void;
    expandAllFolders: () => void;
    expandAllFoldersSynchronously: (intervalDelay?: number) => void;
    focusPreviousTreeItem: () => void;
    focusNextTreeItem: () => void;
    focusTreeItemParentFolder: (treeItem: FolderTreeItem) => void;
    scrollTreeItemIntoView: (treeItemId: string, scrollArgs?: ScrollIntoViewOptions) => void;
    scrollTreeItemIntoViewSelectAndEdit: (
        treeItemId: string,
        scrollArgs?: ScrollIntoViewOptions
    ) => void;
    setTreeItemInEditMode: (treeItem: FolderTreeItem) => void;
    stopTreeItemInEditMode: () => void;
    cancelTreeItemInEditMode: () => void;
}

interface FolderTreeProps {
    /**
     * Items of the FolderTree (an item can be a Folder or a FolderItem, which are both TreeItems)
     * Items will be nested and sorted automatically to build the folder tree.
     */
    treeItems: FolderTreeItem[];
    /**
     * If set to true, the branch lines that are not highlighted will always be visible. 🚨MAY REDUCE PERFORMANCE🚨
     */
    showInactiveBranchLines?: boolean;
    size?: FolderTreeSize;
    onTreeItemEditEnd?: (treeItem: FolderTreeItem) => void;
    onTreeItemContextMenu?: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        treeItem: FolderTreeItem
    ) => void;
    onFolderTreeRootContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    /**
     * If the callback provided is not wrapped with a useCallback,
     * any rerender of the component declaring the callback will cause the tree to rebuild, 🚨 which in turn may reduce performance 🚨
     */
    sortTreeItemsBy?: (a: FolderTreeItem, b: FolderTreeItem) => number;
}

const FolderTree = forwardRef<FolderTreeRef, FolderTreeProps>(
    (
        {
            treeItems: items,
            showInactiveBranchLines,
            size,
            onTreeItemEditEnd,
            onTreeItemContextMenu,
            onFolderTreeRootContextMenu,
            onKeyDown,
            onMouseEnter,
            onMouseLeave,
            sortTreeItemsBy,
        }: FolderTreeProps,
        ref
    ) => {
        const {
            setRefCallback: setFolderRefCallback,
            getNode: getFolderRef,
            setNodeActionCallback: setFolderNodeActionCallback,
        } = useRefCallback<FolderRef>();
        const {
            setRefCallback: setFolderItemRefCallback,
            getNode: getFolderItemRef,
            setNodeActionCallback: setFolderItemNodeActionCallback,
        } = useRefCallback<TreeItemRef>();

        const [selectedTreeItem, setSelectedTreeItem] = useState<FolderTreeItem>();
        const [focusedTreeItem, setFocusedTreeItem] = useState<FolderTreeItem>();
        const [treeItemInEditMode, setTreeItemInEditMode] = useState<FolderTreeItem>();
        const [openedParentFolderOfSelectedItem, setOpenedParentFolderOfSelectedItem] =
            useState<FolderTreeItem>();

        useImperativeHandle(ref, () => ({
            getSelectedTreeItem: () => selectedTreeItem,
            setSelectedTreeItem: handleSelectTreeItem,
            selectTreeItemParentFolder: handleSelectTreeItemParentFolder,
            getFocusedTreeItem: () => focusedTreeItem,
            setFocusedTreeItem: handleSetFocusedTreeItem,
            focusTreeItem: handleFocusTreeItem,
            openFolder: handleOpenFolderFlushSync,
            closeFolder: handleCloseFolderFlushSync,
            openFocusedFolder: handleOpenFocusedFolder,
            closeFocusedFolder: handleCloseFocusedFolder,
            collapseAllFolders: handleCollapseAllFolders,
            expandAllFolders: handleExpandAllFolders,
            expandAllFoldersSynchronously: handleExpandAllFoldersSynchronously,
            focusNextTreeItem: handleFocusNextTreeItem,
            focusPreviousTreeItem: handleFocusPreviousItem,
            focusTreeItemParentFolder: handleFocusTreeItemParentFolder,
            scrollTreeItemIntoView: handleScrollTreeItemIntoView,
            scrollTreeItemIntoViewSelectAndEdit: handleScrollTreeItemIntoViewSelectAndEdit,
            setTreeItemInEditMode: handleSetTreeItemInEditMode,
            stopTreeItemInEditMode: handleStopTreeItemInEditMode,
            cancelTreeItemInEditMode: handleCancelTreeItemInEditMode,
        }));

        const sortedTreeItemsMemo = useMemo(
            () => sortTreeItems(items, sortTreeItemsBy),
            [items, sortTreeItemsBy]
        );

        const buildedTreeMemo = useMemo(
            () => buildTree(sortedTreeItemsMemo),
            [sortedTreeItemsMemo]
        );

        const traversedTreeMemo = useMemo(
            () => getTraversedTree(buildedTreeMemo.nestedFolderTreeItems),
            [buildedTreeMemo]
        );

        const getTreeItemRef = (treeItem: FolderTreeItem) => {
            if (!treeItem) return;

            let ref: TreeItemRef;

            if (treeItem.itemType === TreeItemType.Folder) {
                ref = getFolderRef(treeItem.id);
            } else {
                ref = getFolderItemRef(treeItem.id);
            }

            return ref;
        };

        const handleOpenFolderFlushSync = (treeItem: FolderTreeItem) => {
            /**
             * Sync our Folder's isFolderOpen state, handleSetOpenedParentFolderOfSelectedItem needs the synchronized state
             */
            flushSync(() => {
                getFolderRef(treeItem.id)?.openFolder();
            });
        };

        const handleCloseFolderFlushSync = (treeItem: FolderTreeItem) => {
            /**
             * Sync our Folder's isFolderOpen state, handleSetOpenedParentFolderOfSelectedItem needs the synchronized state
             */
            flushSync(() => {
                getFolderRef(treeItem.id)?.closeFolder();
            });
        };

        const handleOpenFocusedFolder = () => {
            if (!focusedTreeItem || focusedTreeItem?.itemType === TreeItemType.FolderItem) {
                return;
            }

            handleOpenFolderFlushSync(focusedTreeItem);
            handleSetOpenedParentFolderOfSelectedItem(focusedTreeItem);
        };

        const handleCloseFocusedFolder = () => {
            if (!focusedTreeItem || focusedTreeItem?.itemType === TreeItemType.FolderItem) {
                return;
            }

            handleCloseFolderFlushSync(focusedTreeItem);
            handleSetOpenedParentFolderOfSelectedItem(focusedTreeItem);
        };

        const handleCollapseAllFolders = () => {
            const treeItemsMap = buildedTreeMemo.treeItemsMap;

            treeItemsMap.forEach((treeItem) => {
                if (treeItem.itemType === TreeItemType.Folder) {
                    getFolderRef(treeItem.id).closeFolder();
                }
            });

            handleSetSelectedAndFocusedTreeItem(undefined);
        };

        const handleExpandAllFoldersSynchronously = async () => {
            for (const treeItem of traversedTreeMemo) {
                if (treeItem.itemType === TreeItemType.Folder) {
                    await getFolderRef(treeItem.id).openFolder();
                }
            }
        };

        const handleExpandAllFolders = () => {
            for (const treeItem of traversedTreeMemo) {
                if (treeItem.itemType === TreeItemType.Folder) {
                    getFolderRef(treeItem.id).openFolder();
                }
            }
        };

        const handleSetTreeItemInEditMode = (treeItem: FolderTreeItem) => {
            /**
             * Our tree item ref might not have been attached yet.
             */
            if (treeItem.itemType === TreeItemType.Folder) {
                setFolderNodeActionCallback(treeItem.id, (node) => {
                    node.setInEditMode();
                });
            } else {
                setFolderItemNodeActionCallback(treeItem.id, (node) => {
                    node.setInEditMode();
                });
            }

            setTreeItemInEditMode(treeItem);
            handleSetOpenedParentFolderOfSelectedItem(treeItem);
        };

        const handleStopTreeItemInEditMode = () => {
            if (!treeItemInEditMode) return;

            getTreeItemRef(treeItemInEditMode)?.stopEditMode();
            setTreeItemInEditMode(undefined);
        };

        const handleCancelTreeItemInEditMode = () => {
            if (!treeItemInEditMode) return;

            getTreeItemRef(treeItemInEditMode)?.cancelEditMode();
            setTreeItemInEditMode(undefined);
        };

        const handleScrollTreeItemIntoView = (
            treeItemId: string,
            scrollArgs: ScrollIntoViewOptions
        ) => {
            const treeItem = buildedTreeMemo.treeItemsMap.get(treeItemId);

            if (!treeItem) return;

            getTreeItemRef(treeItem)?.scrollIntoView(scrollArgs);
        };

        const handleScrollTreeItemIntoViewSelectAndEdit = (
            treeItemId: string,
            scrollArgs: ScrollIntoViewOptions
        ) => {
            const treeItem = buildedTreeMemo.treeItemsMap.get(treeItemId);

            if (!treeItem) return;

            handleOpenTreeItemAncestorsFoldersSynchronously(treeItem);
            handleSelectTreeItem(treeItem);
            getTreeItemRef(treeItem)?.scrollIntoViewAndEdit(scrollArgs);
            setTreeItemInEditMode(treeItem);
        };

        const handleOpenTreeItemAncestorsFoldersSynchronously = async (
            treeItem: FolderTreeItem
        ) => {
            if (!treeItem.ancestorFolderIds) return;

            for (const ancestorFolderId of treeItem.ancestorFolderIds) {
                await getFolderRef(ancestorFolderId)?.openFolder();
            }
        };

        const handleSelectTreeItem = (treeItem: FolderTreeItem) => {
            setSelectedTreeItem(treeItem);
            handleSetOpenedParentFolderOfSelectedItem(treeItem);
        };

        const handleSelectTreeItemParentFolder = (treeItem: FolderTreeItem) => {
            const parentFolder = buildedTreeMemo.treeItemsMap.get(treeItem.parentFolderId);
            handleSelectTreeItem(parentFolder);
        };

        const handleFocusTreeItem = (treeItem: FolderTreeItem, options?: FocusOptions) => {
            getTreeItemRef(treeItem)?.focus(options);
            handleSetOpenedParentFolderOfSelectedItem(treeItem);
            setFocusedTreeItem(treeItem);
        };

        const handleSetFocusedTreeItem = (treeItem: FolderTreeItem) => {
            setFocusedTreeItem(treeItem);
            handleSetOpenedParentFolderOfSelectedItem(treeItem);
        };

        const handleSetSelectedAndFocusedTreeItem = (treeItem: FolderTreeItem) => {
            setSelectedTreeItem(treeItem);
            setFocusedTreeItem(treeItem);
            handleSetOpenedParentFolderOfSelectedItem(treeItem);
        };

        const handleFocusNextTreeItem = (treeItemFromRecursion?: FolderTreeItem) => {
            if (!traversedTreeMemo || !traversedTreeMemo.length) return;

            const selectedOrFocusedTreeItem =
                treeItemFromRecursion ?? focusedTreeItem ?? selectedTreeItem;

            if (!selectedOrFocusedTreeItem) {
                handleFocusTreeItem(traversedTreeMemo[0]);
                return;
            }

            const focusedTreeItemIndex = traversedTreeMemo.findIndex(
                (treeItem) => treeItem.id === selectedOrFocusedTreeItem?.id
            );

            if (focusedTreeItemIndex === traversedTreeMemo.length - 1) {
                // Our focused item is the last item of the tree, we can't go lower.
                return;
            }

            if (
                !treeItemFromRecursion &&
                selectedOrFocusedTreeItem.items?.length &&
                getFolderRef(focusedTreeItem?.id)?.isFolderOpen() // If the item is a folder and it is open with items
            ) {
                handleFocusTreeItem(selectedOrFocusedTreeItem.items[0]);
            } else {
                const parentFolder = buildedTreeMemo.treeItemsMap.get(
                    selectedOrFocusedTreeItem.parentFolderId
                );

                if (!parentFolder) {
                    /**
                     * We are at the root.
                     * Our buildedTreeMemo contains nestedFolderTreeItems which contains all the items at the root of our tree.
                     * See if we can focus an item bellow the tree item passed as an argument from recursion.
                     */
                    const nestedFolderTreeItems = buildedTreeMemo.nestedFolderTreeItems;
                    const treeItemIndex = nestedFolderTreeItems.findIndex(
                        (treeItem) =>
                            treeItem.id ===
                            (treeItemFromRecursion
                                ? treeItemFromRecursion.id
                                : selectedOrFocusedTreeItem.id)
                    );

                    if (nestedFolderTreeItems.length - 1 > treeItemIndex) {
                        handleFocusTreeItem(nestedFolderTreeItems[treeItemIndex + 1]);
                    }
                } else {
                    const treeItemIndex = parentFolder?.items?.findIndex(
                        (item) => item.id === selectedOrFocusedTreeItem.id
                    );

                    if (parentFolder?.items?.length - 1 > treeItemIndex) {
                        handleFocusTreeItem(parentFolder.items[treeItemIndex + 1]);
                    } else {
                        handleFocusNextTreeItem(parentFolder);
                    }
                }
            }
        };

        const handleFocusPreviousItem = (treeItemFromRecursion?: FolderTreeItem) => {
            if (!traversedTreeMemo || !traversedTreeMemo.length) return;

            const selectedOrFocusedTreeItem =
                treeItemFromRecursion ?? focusedTreeItem ?? selectedTreeItem;

            if (!selectedOrFocusedTreeItem) {
                handleFocusTreeItem(traversedTreeMemo[0]);
                return;
            }

            const focusedTreeItemIndex = traversedTreeMemo.findIndex(
                (treeItem) => treeItem.id === selectedOrFocusedTreeItem?.id
            );

            if (focusedTreeItemIndex === 0) {
                // Our focused item is the first item of the tree, we can't go higher.
                return;
            }

            const previousItem = traversedTreeMemo[focusedTreeItemIndex - 1];

            let closedAncestorFolderId = "";
            let areAllAncestorFoldersOpen = true;

            for (const ancestorFolderId of previousItem.ancestorFolderIds) {
                const isAncestorFolderOpen = getFolderRef(ancestorFolderId)?.isFolderOpen();

                if (!isAncestorFolderOpen) {
                    closedAncestorFolderId = ancestorFolderId;
                    areAllAncestorFoldersOpen = false;
                }
            }

            if (areAllAncestorFoldersOpen) {
                handleFocusTreeItem(previousItem);
            } else {
                const closedAncestorFolder =
                    buildedTreeMemo.treeItemsMap.get(closedAncestorFolderId);
                handleFocusPreviousItem(closedAncestorFolder.items?.[0]);
            }
        };

        const handleFocusTreeItemParentFolder = (treeItem: FolderTreeItem) => {
            const parentFolder = buildedTreeMemo.treeItemsMap.get(treeItem.parentFolderId);
            handleFocusTreeItem(parentFolder);
        };

        const handleTreeItemClick = (treeItem: FolderTreeItem) => {
            if (treeItem.itemType === TreeItemType.Folder) {
                /**
                 * We need the isOpen state of the folder to be synced for handleSetOpenedParentFolderOfSelectedItem
                 */
                flushSync(() => {
                    getFolderRef(treeItem.id)?.toggleIsOpen();
                });
            }

            handleSetSelectedAndFocusedTreeItem(treeItem);
        };

        const handleSetOpenedParentFolderOfSelectedItem = (
            treeItem: FolderTreeItem | undefined
        ) => {
            if (!treeItem) {
                setOpenedParentFolderOfSelectedItem(undefined);
                return;
            }

            /**
             * The selected and focused item is now the treeItem passed as an argument.
             */
            if (treeItem.itemType === TreeItemType.Folder) {
                /*
                 * If the treeItem is a folder an it is opened,
                 * the closestOpenedAncestorFolderOfSelectedItem is the treeItem itself.
                 *
                 * If the treeItem is a folder and it is closed,
                 * the closestOpenedAncestorFolderOfSelectedItem would be the closest ancestor folder of the tree item that is opened.
                 */
                const isFolderOpen = getFolderRef(treeItem.id)?.isFolderOpen();

                if (isFolderOpen) {
                    setOpenedParentFolderOfSelectedItem(treeItem);
                } else if (!treeItem.parentFolderId) {
                    setOpenedParentFolderOfSelectedItem(undefined);
                } else if (!treeItem.ancestorFolderIds) {
                    setOpenedParentFolderOfSelectedItem(
                        buildedTreeMemo.treeItemsMap.get(treeItem.parentFolderId)
                    );
                } else {
                    // Our items are sorted, iterate through them backward so we can find the closest opened ancestor folder
                    for (let i = treeItem.ancestorFolderIds.length - 1; i >= 0; i--) {
                        const ancestorFolderId = treeItem.ancestorFolderIds[i];

                        const isAncestorFolderOpen = getFolderRef(ancestorFolderId)?.isFolderOpen();

                        if (isAncestorFolderOpen) {
                            setOpenedParentFolderOfSelectedItem(
                                buildedTreeMemo.treeItemsMap.get(ancestorFolderId)
                            );
                            break;
                        }
                    }
                }
            } else {
                /**
                 * If the selected item is a FolderItem,
                 * the active folder is the parent folder of the selected item.
                 */
                const closestOpenedAncestorFolderOfSelectedItem = buildedTreeMemo.treeItemsMap.get(
                    treeItem.parentFolderId
                );
                setOpenedParentFolderOfSelectedItem(closestOpenedAncestorFolderOfSelectedItem);
            }
        };

        const handleFolderTreeRootClick = () => {
            handleSetSelectedAndFocusedTreeItem(undefined);
        };

        const handleFolderTreeRootContextMenu = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>
        ) => {
            handleSetSelectedAndFocusedTreeItem(undefined);
            onFolderTreeRootContextMenu?.(e);
        };

        const renderTree = (treeItems: FolderTreeItem[]): JSX.Element[] => {
            return treeItems.map((treeItem) => {
                const isDescendentOfOpenedParentFolderOfSelectedItem =
                    treeItem.ancestorFolderIds.some(
                        (ancestorFolderId) =>
                            ancestorFolderId === openedParentFolderOfSelectedItem?.id
                    );

                const sharedProps: TreeItemProps = {
                    branchLineDepthToHighlight:
                        (treeItem.id === openedParentFolderOfSelectedItem?.id ||
                            isDescendentOfOpenedParentFolderOfSelectedItem) &&
                        openedParentFolderOfSelectedItem.depth,
                    isSelected: selectedTreeItem?.id === treeItem.id,
                    isFocused: focusedTreeItem?.id === treeItem.id,
                    showInactiveBranchLines: showInactiveBranchLines,
                    treeItem: treeItem,
                    size,
                    onClick: handleTreeItemClick,
                    onEditEnd: onTreeItemEditEnd,
                    onContextMenu: onTreeItemContextMenu,
                };

                if (treeItem.itemType === TreeItemType.FolderItem) {
                    return (
                        <FolderItem
                            key={`${treeItem.id}-${treeItem.depth}`}
                            ref={(node) => setFolderItemRefCallback(treeItem.id, node)}
                            {...sharedProps}
                        />
                    );
                } else {
                    // We have a folder. We need to render all it's items
                    let folderItems;

                    if (treeItem.items?.length) {
                        folderItems = renderTree(treeItem.items);
                    }

                    return (
                        <Folder
                            key={`${treeItem.id}-${treeItem.depth}`}
                            ref={(node) => setFolderRefCallback(treeItem.id, node)}
                            {...sharedProps}
                        >
                            {folderItems}
                        </Folder>
                    );
                }
            });
        };

        return (
            <div
                className="folder-tree"
                tabIndex={0} // Needed for focus
                onKeyDown={onKeyDown}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {renderTree(buildedTreeMemo.nestedFolderTreeItems)}
                <div
                    className="folder-tree__footer"
                    onClick={handleFolderTreeRootClick}
                    onContextMenu={handleFolderTreeRootContextMenu}
                ></div>
            </div>
        );
    }
);

FolderTree.displayName = "FolderTree";
export default FolderTree;

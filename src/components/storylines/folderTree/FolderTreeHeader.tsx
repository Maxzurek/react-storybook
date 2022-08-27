import "./FolderTreeHeader.scss";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import {
    Autocomplete,
    StyledEngineProvider,
    TextField,
    Tooltip,
} from "@mui/material";
import { ITreeItem, TreeItemType } from "./TreeItem.interfaces";
import AddFolder from "../../../icons/AddFolder.icon";
import AddFile from "../../../icons/AddFile.icon";
import Collapse from "../../../icons/Collapse.icon";
import Expand from "../../../icons/Expand.icon";

export interface FolderTreeHeaderRef {
    setIsVisible: (isVisible: boolean) => void;
}

interface FolderTreeHeaderProps {
    traversedAndSortedTreeMemo: ITreeItem[];
    onAddTreeItem: (treeItemType: TreeItemType) => void;
    onCollapseFolders: () => void;
    onExpandFolders: () => void;
    onScrollItemIntoViewSelectAndEdit: (treeItem: ITreeItem) => void;
}

const FolderTreeHeader = forwardRef<
    FolderTreeHeaderRef | undefined,
    FolderTreeHeaderProps
>(
    (
        {
            traversedAndSortedTreeMemo,
            onAddTreeItem,
            onCollapseFolders,
            onExpandFolders,
            onScrollItemIntoViewSelectAndEdit,
        }: FolderTreeHeaderProps,
        ref
    ) => {
        const [isVisible, setIsVisible] = useState(false);
        const [areFoldersCollapsed, setAreFoldersCollapsed] = useState(false);

        useImperativeHandle(ref, () => ({
            setIsVisible,
        }));

        const isTouchDevice = useMemo(() => "ontouchstart" in window, []);

        const handleAddTreeItem = (treeItemType: TreeItemType) => {
            return (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.stopPropagation();
                onAddTreeItem(treeItemType);
            };
        };

        const handleCollapseFolders = () => {
            setAreFoldersCollapsed(true);
            onCollapseFolders();
        };

        const handleExpandFolders = () => {
            setAreFoldersCollapsed(false);
            onExpandFolders();
        };

        const handleActionButtonsDivClick = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>
        ) => {
            e.stopPropagation();
        };

        const handleAutocompleteChange = (
            _event: React.SyntheticEvent<Element, Event>,
            treeItem: string | ITreeItem
        ) => {
            if (!treeItem) return;
            onScrollItemIntoViewSelectAndEdit(treeItem as ITreeItem);
        };

        const actionButtonsClassNames = ["folder-tree-header__action-buttons"];
        (isVisible || isTouchDevice) &&
            actionButtonsClassNames.push(
                "folder-tree-header__action-buttons--visible"
            );

        return (
            <div className="folder-tree-header">
                <span className="folder-tree-header__title">
                    Title Placeholder
                </span>
                <div
                    className={actionButtonsClassNames.join(" ")}
                    onClick={handleActionButtonsDivClick}
                >
                    <Tooltip arrow disableInteractive title="New item">
                        <button
                            className="story__button"
                            onClick={handleAddTreeItem(TreeItemType.FolderItem)}
                        >
                            <AddFile />
                        </button>
                    </Tooltip>
                    <Tooltip arrow disableInteractive title="New folder">
                        <button
                            className="story__button"
                            onClick={handleAddTreeItem(TreeItemType.Folder)}
                        >
                            <AddFolder />
                        </button>
                    </Tooltip>
                    <Tooltip
                        arrow
                        disableInteractive
                        title={
                            areFoldersCollapsed
                                ? "Expand all folders"
                                : "Collapse all folders"
                        }
                    >
                        <button
                            className="story__button"
                            onClick={() =>
                                areFoldersCollapsed
                                    ? handleExpandFolders()
                                    : handleCollapseFolders()
                            }
                        >
                            {areFoldersCollapsed ? <Expand /> : <Collapse />}
                        </button>
                    </Tooltip>
                </div>
                <StyledEngineProvider injectFirst>
                    <Autocomplete
                        className="folder-tree-header__search-bar"
                        options={traversedAndSortedTreeMemo.filter(
                            (treeItem) =>
                                treeItem.itemType !== TreeItemType.RootFolder
                        )}
                        renderInput={(inputParams) => (
                            <TextField
                                {...inputParams}
                                label="Scroll to and edit"
                                size="small"
                            />
                        )}
                        renderOption={(props, option) => {
                            return (
                                <li {...props} key={option.id}>
                                    {option.label}
                                </li>
                            );
                        }}
                        selectOnFocus
                        sx={{ width: 300 }}
                        onChange={handleAutocompleteChange}
                    />
                </StyledEngineProvider>
            </div>
        );
    }
);

FolderTreeHeader.displayName = "FolderTreeHeader";
export default FolderTreeHeader;

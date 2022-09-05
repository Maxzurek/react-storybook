import "./FolderTreeHeader.scss";

import { useState } from "react";
import { Autocomplete, StyledEngineProvider, TextField, Tooltip } from "@mui/material";
import { FolderTreeItem, TreeItemType } from "./TreeItem.interfaces";
import AddFolder from "../../../icons/AddFolder.icon";
import AddFile from "../../../icons/AddFile.icon";
import Collapse from "../../../icons/Collapse.icon";
import Expand from "../../../icons/Expand.icon";
import React from "react";
import { flushSync } from "react-dom";

interface FolderTreeHeaderProps {
    treeItems: FolderTreeItem[];
    showActionButtons?: boolean;
    isTouchDevice?: boolean;
    onAddTreeItem: (treeItemType: TreeItemType) => void;
    onCollapseFolders: () => void;
    onExpandFolders: () => void;
    onScrollItemIntoViewAndEdit: (treeItem: FolderTreeItem) => void;
}

const FolderTreeHeader = ({
    treeItems,
    showActionButtons,
    isTouchDevice,
    onAddTreeItem,
    onCollapseFolders,
    onExpandFolders,
    onScrollItemIntoViewAndEdit,
}: FolderTreeHeaderProps) => {
    const [areActionButtonsVisible, setAreActionButtonsVisible] = useState(true);
    const [areFoldersCollapsed, setAreFoldersCollapsed] = useState(false);
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

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

    const handleOptionClick = (treeItem: FolderTreeItem) => {
        // We want to close the autocomplete dropdown menu before scrolling to our item
        flushSync(() => {
            setIsAutocompleteOpen(false);
        });
        onScrollItemIntoViewAndEdit(treeItem);
    };

    const handleTextfieldFocus = () => {
        setIsAutocompleteOpen(true);
    };

    const handleTextfieldBlur = () => {
        setIsAutocompleteOpen(false);
    };

    const handleMouseEnter = () => {
        setAreActionButtonsVisible(true);
    };

    const handleMouseLeave = () => {
        setAreActionButtonsVisible(false);
    };

    const actionButtonsClassNames = ["folder-tree-header__action-buttons"];
    isTouchDevice && actionButtonsClassNames.push("folder-tree-header__action-buttons--large");
    (areActionButtonsVisible || showActionButtons || isTouchDevice) &&
        actionButtonsClassNames.push("folder-tree-header__action-buttons--visible");

    return (
        <div
            className="folder-tree-header"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className="folder-tree-header__title">Title Placeholder</span>
            <div className={actionButtonsClassNames.join(" ")}>
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
                    title={areFoldersCollapsed ? "Expand all folders" : "Collapse all folders"}
                >
                    <button
                        className="story__button"
                        onClick={() =>
                            areFoldersCollapsed ? handleExpandFolders() : handleCollapseFolders()
                        }
                    >
                        {areFoldersCollapsed ? <Expand /> : <Collapse />}
                    </button>
                </Tooltip>
            </div>
            {/** Inject MUI style first so our component style's specificity does not get overridden by MUI */}
            <StyledEngineProvider injectFirst>
                <Autocomplete
                    className="folder-tree-header__search-bar"
                    groupBy={(option) => {
                        return treeItems.find((treeITem) => treeITem.id === option.parentFolderId)
                            ?.label;
                    }}
                    noOptionsText="No items found"
                    open={isAutocompleteOpen}
                    options={treeItems.filter(
                        (treeItem) => treeItem.itemType !== TreeItemType.Folder
                    )}
                    renderInput={(inputParams) => (
                        <TextField
                            {...inputParams}
                            label="Scroll to and edit"
                            size="small"
                            onBlur={handleTextfieldBlur}
                            onFocus={handleTextfieldFocus}
                        />
                    )}
                    renderOption={(props, option) => {
                        return (
                            <li
                                {...props}
                                key={option.id}
                                onClick={() => handleOptionClick(option)}
                            >
                                {option.label}
                            </li>
                        );
                    }}
                    selectOnFocus
                />
            </StyledEngineProvider>
        </div>
    );
};

FolderTreeHeader.displayName = "FolderTreeHeader";
export default FolderTreeHeader;

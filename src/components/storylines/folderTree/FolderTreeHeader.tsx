import "./FolderTreeHeader.scss";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Tooltip } from "@mui/material";
import { TreeItemType } from "./TreeItem.interfaces";
import AddFolder from "../../../icons/AddFolder.icon";
import AddFile from "../../../icons/AddFile.icon";
import Collapse from "../../../icons/Collapse.icon";
import Expand from "../../../icons/Expand.icon";

export interface FolderTreeHeaderRef {
    setIsVisible: (isVisible: boolean) => void;
}

interface FolderTreeHeaderProps {
    onAddTreeItem: (treeItemType: TreeItemType) => void;
    onCollapseFolders: () => void;
    onExpandFolders: () => void;
    onClick?: () => void;
}

const FolderTreeHeader = forwardRef<
    FolderTreeHeaderRef | undefined,
    FolderTreeHeaderProps
>(
    (
        {
            onAddTreeItem,
            onCollapseFolders,
            onExpandFolders,
            onClick,
        }: FolderTreeHeaderProps,
        ref
    ) => {
        const [isVisible, setIsVisible] = useState(false);
        const [areFoldersCollapsed, setAreFoldersCollapsed] = useState(false);

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

        useImperativeHandle(ref, () => ({
            setIsVisible,
        }));

        const actionButtonsClassNames = ["folder-tree-header__action-buttons"];
        (isVisible || isTouchDevice) &&
            actionButtonsClassNames.push(
                "folder-tree-header__action-buttons--visible"
            );

        return (
            <div className="folder-tree-header" onClick={onClick}>
                <span className="folder-tree-header__title">Folder tree</span>
                <div
                    className={actionButtonsClassNames.join(" ")}
                    onClick={(e) => e.stopPropagation()}
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
            </div>
        );
    }
);

FolderTreeHeader.displayName = "FolderTreeHeader";
export default FolderTreeHeader;

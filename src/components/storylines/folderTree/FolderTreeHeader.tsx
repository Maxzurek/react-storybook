import "./FolderTreeHeader.scss";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Tooltip } from "@mui/material";
import { ETreeItemType } from "./TreeItem.interfaces";
import AddFolder from "../../../icons/AddFolder.icon";
import AddFile from "../../../icons/AddFile.icon";
import Collapse from "../../../icons/Collapse.icon";

export interface FolderTreeHeaderRef {
    setIsVisible: (isVisible: boolean) => void;
}

interface FolderTreeHeaderProps {
    onAddTreeItem: (treeItemType: ETreeItemType) => void;
    onCollapseFolders: () => void;
    onClick?: () => void;
}

const FolderTreeHeader = forwardRef<
    FolderTreeHeaderRef | undefined,
    FolderTreeHeaderProps
>(
    (
        { onAddTreeItem, onCollapseFolders, onClick }: FolderTreeHeaderProps,
        ref
    ) => {
        const [isVisible, setIsVisible] = useState(false);

        const handleAddTreeItem = (treeItemType: ETreeItemType) => {
            return (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.stopPropagation();
                onAddTreeItem(treeItemType);
            };
        };

        useImperativeHandle(ref, () => ({
            setIsVisible,
        }));

        const actionButtonsClassNames = ["folder-tree-header__action-buttons"];
        isVisible &&
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
                            onClick={handleAddTreeItem(
                                ETreeItemType.FolderItem
                            )}
                        >
                            <AddFile />
                        </button>
                    </Tooltip>
                    <Tooltip arrow disableInteractive title="New folder">
                        <button
                            className="story__button"
                            onClick={handleAddTreeItem(ETreeItemType.Folder)}
                        >
                            <AddFolder />
                        </button>
                    </Tooltip>
                    <Tooltip arrow disableInteractive title="Collapse folders">
                        <button
                            className="story__button"
                            onClick={() => onCollapseFolders()}
                        >
                            <Collapse />
                        </button>
                    </Tooltip>
                </div>
            </div>
        );
    }
);

FolderTreeHeader.displayName = "FolderTreeHeader";
export default FolderTreeHeader;

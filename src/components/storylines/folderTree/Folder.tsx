import "./Folder.scss";

import { forwardRef } from "react";
import TreeItem, { TreeItemRef, TreeItemProps } from "./TreeItem";
import OpenedFolder from "../../../icons/OpenedFolder.icon";
import ClosedFolder from "../../../icons/ClosedFolder.icon";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AnimateHeight from "react-animate-height";
import { TreeItemType } from "./TreeItem.interfaces";
import React from "react";

export interface FolderProps extends TreeItemProps {
    isOpen: boolean;
    children?: JSX.Element[];
    emptyFolderLabel?: string;
}

const Folder = forwardRef<TreeItemRef, FolderProps>(
    ({ children, isOpen, emptyFolderLabel, ...treeItemProps }, ref) => {
        const expansionAnimationDuration = 250;
        const emptyTreeItemComponent = (
            <TreeItem
                {...treeItemProps}
                isDisabled
                treeItem={{
                    id: "FOLDER-TREE__EMPTY-FOLDER",
                    label: emptyFolderLabel ? emptyFolderLabel : "This folder is empty",
                    depth: treeItemProps.treeItem.depth + 1,
                    itemType: TreeItemType.FolderItem,
                    parentFolderId: treeItemProps.treeItem.id,
                    ancestorFolderIds: treeItemProps.treeItem.ancestorFolderIds,
                }}
            />
        );

        return (
            <div className="folder">
                <TreeItem
                    {...treeItemProps}
                    ref={ref}
                    caretIcon={
                        treeItemProps.caretIcon ? (
                            treeItemProps.caretIcon
                        ) : (
                            <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
                        )
                    }
                    icon={
                        treeItemProps.icon ? (
                            treeItemProps.icon
                        ) : isOpen ? (
                            <OpenedFolder />
                        ) : (
                            <ClosedFolder />
                        )
                    }
                />
                <AnimateHeight
                    duration={expansionAnimationDuration}
                    height={isOpen ? "auto" : 0}
                    id={`folder-items-${treeItemProps.treeItem.id}`}
                >
                    {children ? children : emptyTreeItemComponent}
                </AnimateHeight>
            </div>
        );
    }
);

Folder.displayName = "Folder";
export default Folder;

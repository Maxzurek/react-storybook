import "./Folder.scss";

import { forwardRef, useState } from "react";
import TreeItem, { TreeItemRef, TreeItemProps } from "./TreeItem";
import OpenedFolder from "../../../icons/OpenedFolder.icon";
import ClosedFolder from "../../../icons/ClosedFolder.icon";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AnimateHeight from "react-animate-height";
import React from "react";
import DropZone from "../../dragAndDrop/DropZone";
import { FolderTreeItem, TreeItemType } from "./TreeItem.interfaces";

export interface FolderProps extends TreeItemProps {
    isOpen: boolean;
    treeItemChildren: FolderTreeItem[];
    children?: JSX.Element[];
    emptyFolderLabel?: string;
    onDragOver?: (
        e: React.DragEvent<HTMLDivElement>,
        treeItemSourceId: string,
        folderDraggedOver: FolderTreeItem
    ) => void;
    onDrop?: (treeItemSourceId: string, treeItemTargetId: string) => void;
}

const Folder = forwardRef<TreeItemRef, FolderProps>(
    (
        {
            children,
            treeItemChildren,
            isOpen,
            emptyFolderLabel,
            onDragOver,
            onDrop,
            ...treeItemProps
        },
        ref
    ) => {
        const [isDraggedOver, setIsDraggedOver] = useState(false);

        const expansionAnimationDuration = 250;
        const emptyTreeItemComponent = (
            <TreeItem
                {...treeItemProps}
                iconElement={null}
                isDisabled
                labelElement={null}
                leftAdornmentElement={null}
                rightAdornmentElement={null}
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

        const handleDragOver = (e: React.DragEvent<HTMLDivElement>, treeItemSourceId: string) => {
            const isSelf = treeItemSourceId === treeItemProps.treeItem.id;
            const isParentFolderOfItemDragged = treeItemChildren?.find(
                (treeItem) => treeItem.id === treeItemSourceId
            );
            const folderDraggedOver = treeItemProps.treeItem;

            if (!isSelf && !isParentFolderOfItemDragged) {
                setIsDraggedOver(true);
            }

            onDragOver?.(e, treeItemSourceId, folderDraggedOver);
        };

        const handleDragLeave = () => {
            setIsDraggedOver(false);
        };

        const handleDrop = (_e: React.DragEvent<HTMLDivElement>, treeItemSourceId: string) => {
            const isSelf = treeItemSourceId === treeItemProps.treeItem.id;
            const isParentFolderOfItemDragged = treeItemChildren?.find(
                (treeItem) => treeItem.id === treeItemSourceId
            );

            if (isSelf || isParentFolderOfItemDragged) return;

            setIsDraggedOver(false);
            onDrop(treeItemSourceId, treeItemProps.treeItem.id);
        };

        const dropZoneClassNames = ["folder__drop-zone"];
        isDraggedOver && dropZoneClassNames.push("folder__drop-zone--dragged-over");

        return (
            <DropZone
                className={dropZoneClassNames.join(" ")}
                id={treeItemProps.treeItem.id}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="folder">
                    <TreeItem
                        {...treeItemProps}
                        ref={ref}
                        caretIconElement={
                            treeItemProps.caretIconElement ? (
                                treeItemProps.caretIconElement
                            ) : (
                                <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
                            )
                        }
                        iconElement={
                            treeItemProps.iconElement ? (
                                treeItemProps.iconElement
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
            </DropZone>
        );
    }
);

Folder.displayName = "Folder";
export default Folder;

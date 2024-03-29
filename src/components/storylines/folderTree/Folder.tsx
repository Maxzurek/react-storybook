import "./Folder.scss";

import { useMemo, useState } from "react";
import TreeItemMemo, { TreeItemWithMemoProps } from "./TreeItem";
import OpenedFolder from "../../../icons/OpenedFolder.icon";
import ClosedFolder from "../../../icons/ClosedFolder.icon";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DropZone from "../../dragAndDrop/DropZone";
import { FolderTreeItem, TreeItemType } from "./TreeItem.interfaces";
import ExpandableDiv from "../expandableDiv/ExpandableDiv";

export interface FolderProps extends TreeItemWithMemoProps {
    isOpen: boolean;
    children?: JSX.Element[];
    emptyFolderLabel?: string;
    onDragOver?: (
        sourceTreeItem: FolderTreeItem,
        destinationTreeItem: FolderTreeItem,
        isDestinationItemParentOfSourceItem: boolean,
        isDestinationItemChildOfSourceItem: boolean,
        e?: React.DragEvent<HTMLDivElement>
    ) => void;
    onDrop?: (sourceTreeItem: FolderTreeItem, destinationTreeItem: FolderTreeItem) => void;
}

const Folder = ({
    children,
    isOpen,
    emptyFolderLabel,
    onDragOver,
    onDrop,
    ...treeItemProps
}: FolderProps) => {
    const [isDraggedOver, setIsDraggedOver] = useState(false);

    const caretIconElementMemo = useMemo(
        () =>
            treeItemProps.caretIconElement ? (
                treeItemProps.caretIconElement
            ) : (
                <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
            ),
        [isOpen, treeItemProps.caretIconElement]
    );

    const iconElementMemo = useMemo(
        () =>
            treeItemProps.iconElement ? (
                treeItemProps.iconElement
            ) : isOpen ? (
                <OpenedFolder />
            ) : (
                <ClosedFolder />
            ),
        [isOpen, treeItemProps.iconElement]
    );

    const expansionAnimationDuration = 250;
    const emptyTreeItemComponent = (
        <TreeItemMemo
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

    const parseDragAndDropData = (dataTransfer: DataTransfer) => {
        const data = dataTransfer.getData("text/plain");
        const sourceTreeItem = JSON.parse(data) as FolderTreeItem;
        const destinationTreeItem = treeItemProps.treeItem;
        const isSelf = sourceTreeItem.id === destinationTreeItem.id;
        const isDestinationItemParentOfSourceItem =
            sourceTreeItem.parentFolderId === destinationTreeItem.id;
        const isDestinationItemChildOfSourceItem = destinationTreeItem.ancestorFolderIds?.some(
            (ancestorId) => ancestorId === sourceTreeItem.id
        );

        return {
            sourceTreeItem,
            destinationTreeItem,
            isSelf,
            isDestinationItemParentOfSourceItem,
            isDestinationItemChildOfSourceItem,
        };
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, dataTransfer: DataTransfer) => {
        const {
            destinationTreeItem,
            isDestinationItemChildOfSourceItem,
            isDestinationItemParentOfSourceItem,
            isSelf,
            sourceTreeItem,
        } = parseDragAndDropData(dataTransfer);

        if (
            !isSelf &&
            !isDestinationItemParentOfSourceItem &&
            !isDestinationItemChildOfSourceItem
        ) {
            setIsDraggedOver(true);
        }

        onDragOver?.(
            sourceTreeItem,
            destinationTreeItem,
            isDestinationItemParentOfSourceItem,
            isDestinationItemChildOfSourceItem,
            e
        );
    };

    const handleDragLeave = () => {
        setIsDraggedOver(false);
    };

    const handleDrop = (_e: React.DragEvent<HTMLDivElement>, dataTransfer: DataTransfer) => {
        const {
            destinationTreeItem,
            isDestinationItemChildOfSourceItem,
            isDestinationItemParentOfSourceItem,
            isSelf,
            sourceTreeItem,
        } = parseDragAndDropData(dataTransfer);

        if (isSelf || isDestinationItemParentOfSourceItem || isDestinationItemChildOfSourceItem)
            return;

        setIsDraggedOver(false);
        onDrop(sourceTreeItem, destinationTreeItem);
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
                <TreeItemMemo
                    {...treeItemProps}
                    caretIconElement={caretIconElementMemo}
                    iconElement={iconElementMemo}
                />
                <ExpandableDiv
                    animationDuration={expansionAnimationDuration}
                    className="folder__expandable-div"
                    id={`folder-items-${treeItemProps.treeItem.id}`}
                    isExpanded={isOpen}
                >
                    {children ? children : emptyTreeItemComponent}
                </ExpandableDiv>
            </div>
        </DropZone>
    );
};

Folder.displayName = "Folder";
export default Folder;

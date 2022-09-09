import "./Folder.scss";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import TreeItem, { TreeItemRef, TreeItemProps } from "./TreeItem";
import OpenedFolder from "../../../icons/OpenedFolder.icon";
import ClosedFolder from "../../../icons/ClosedFolder.icon";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AnimateHeight, { Height } from "react-animate-height";
import { TreeItemType } from "./TreeItem.interfaces";
import React from "react";

export interface FolderRef extends TreeItemRef {
    openFolder: () => void;
    openFolderAsync: (timeoutDelay: number) => Promise<void>;
    closeFolder: () => void;
    toggleIsOpen: () => void;
    isFolderOpen: () => boolean;
}

export interface FolderProps
    extends Omit<TreeItemProps, "icon" | "leftAdornment" | "rightAdornment"> {
    children?: JSX.Element[];
}

const Folder = forwardRef<FolderRef, FolderProps>(({ children, ...treeItemProps }, ref) => {
    const { treeItem } = treeItemProps;

    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState<Height>(0);

    const treeItemRef = useRef<TreeItemRef>();
    const folderDivRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        innerRef: folderDivRef.current,
        openFolder: handleOpenFolder,
        openFolderAsync: handleOpenFolderAsync,
        closeFolder: handleCloseFolder,
        toggleIsOpen: handleToggleIsFolderOpen,
        isFolderOpen: () => isOpen,
        setInEditMode: handleSetTreeItemInEditMode,
        stopEditMode: handleStopTreeItemEditMode,
        cancelEditMode: handleCancelTreeItemEditMode,
        focus: handleFocusTreeItem,
        scrollIntoView: handleScrollTreeItemIntoView,
        scrollIntoViewAndEdit: handleScrollTreeItemIntoViewAndEdit,
    }));

    const expansionAnimationDuration = 250;
    const emptyTreeItemComponent = (
        <TreeItem
            {...treeItemProps}
            isDisabled
            treeItem={{
                id: "FOLDER-TREE__EMPTY-FOLDER",
                label: "This folder is empty",
                depth: treeItem.depth + 1,
                itemType: TreeItemType.FolderItem,
                parentFolderId: treeItem.id,
                ancestorFolderIds: treeItem.ancestorFolderIds,
            }}
        />
    );

    const handleSetTreeItemInEditMode = () => {
        treeItemRef.current?.setInEditMode();
    };

    const handleStopTreeItemEditMode = () => {
        treeItemRef.current?.stopEditMode();
    };

    const handleCancelTreeItemEditMode = () => {
        treeItemRef.current?.cancelEditMode();
    };

    const handleFocusTreeItem = (options: FocusOptions) => {
        treeItemRef.current?.focus(options);
    };

    const handleScrollTreeItemIntoView = (scrollArgs: ScrollIntoViewOptions) => {
        treeItemRef.current?.scrollIntoView(scrollArgs);
    };

    const handleScrollTreeItemIntoViewAndEdit = (scrollArgs: ScrollIntoViewOptions) => {
        treeItemRef.current?.scrollIntoViewAndEdit(scrollArgs);
    };

    const handleToggleIsFolderOpen = () => {
        if (treeItemProps.isDisabled) return;

        if (isOpen) {
            handleCloseFolder();
        } else {
            handleOpenFolder();
        }
    };

    const handleOpenFolder = async () => {
        if (treeItemProps.isDisabled) return;

        setIsOpen(true);
        setHeight("auto");
    };

    const handleOpenFolderAsync = async (timeoutDelay: number) => {
        setIsOpen(true);
        setHeight("auto");

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeoutDelay);
        });
    };

    const handleCloseFolder = () => {
        if (treeItemProps.isDisabled) return;

        setIsOpen(false);
        setHeight(0);
    };

    return (
        <div ref={folderDivRef} className="folder">
            <TreeItem
                {...treeItemProps}
                ref={treeItemRef}
                icon={isOpen ? <OpenedFolder /> : <ClosedFolder />}
                leftAdornment={<FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />}
            />
            <AnimateHeight
                duration={expansionAnimationDuration}
                height={height}
                id={`folder-items-${treeItem.id}`}
            >
                {children ? children : emptyTreeItemComponent}
            </AnimateHeight>
        </div>
    );
});

Folder.displayName = "Folder";
export default Folder;

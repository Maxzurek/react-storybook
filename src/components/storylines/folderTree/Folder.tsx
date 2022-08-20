import "./Folder.scss";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import TreeItem, { ITreeItemRef, TreeItemProps } from "./TreeItem";
import OpenedFolder from "../../../icons/OpenedFolder.icon";
import ClosedFolder from "../../../icons/ClosedFolder.icon";
import {
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AnimateHeight, { Height } from "react-animate-height";
import { flushSync } from "react-dom";

export interface IFolderRef extends ITreeItemRef {
    openFolder: () => void;
    closeFolder: () => void;
    isFolderOpen: () => boolean;
}

export interface FolderProps
    extends Omit<TreeItemProps, "icon" | "leftAdornment" | "rightAdornment"> {
    children?: JSX.Element[];
}

const Folder = forwardRef<IFolderRef, FolderProps>(
    ({ children, ...TreeItemProps }: FolderProps, ref) => {
        const { id } = TreeItemProps;

        const [isOpen, setIsOpen] = useState(false);
        const [height, setHeight] = useState<Height>(0);

        const treeItemRef = useRef<ITreeItemRef>();
        const folderDivRef = useRef<HTMLDivElement>(null);

        const expansionAnimationDuration = 250;

        const handleTreeItemClick = () => {
            // Our folder tree needs to know if the folder is opened when is it clicked.
            // We need to sync the state before invoking the callback
            flushSync(() => {
                setIsOpen(!isOpen);
                setHeight(height === 0 ? "auto" : 0);
            });
            TreeItemProps.onItemClick?.();
        };

        const handleOpenFolder = () => {
            setIsOpen(true);
            setHeight("auto");
        };

        const handleCloseFolder = () => {
            setIsOpen(false);
            setHeight(0);
        };

        useImperativeHandle(ref, () => ({
            innerRef: folderDivRef.current,
            openFolder: handleOpenFolder,
            closeFolder: handleCloseFolder,
            isFolderOpen: () => isOpen,
            setFocusAndEdit: () => {
                treeItemRef.current?.setFocusAndEdit();
            },
            focus: (options: FocusOptions) => {
                treeItemRef.current?.focus(options);
            },
            scrollIntoView: () => {
                treeItemRef.current?.scrollIntoView();
            },
        }));

        const folderItemsClassNames = ["folder__items"];
        isOpen && folderItemsClassNames.push("folder__items--visible");

        return (
            <div ref={folderDivRef} className="folder">
                <TreeItem
                    {...TreeItemProps}
                    ref={treeItemRef}
                    icon={
                        isOpen ? <OpenedFolder /> : <ClosedFolder height={14} />
                    }
                    leftAdornment={
                        isOpen ? (
                            <FontAwesomeIcon icon={faChevronDown} />
                        ) : (
                            <FontAwesomeIcon icon={faChevronRight} />
                        )
                    }
                    onItemClick={handleTreeItemClick}
                />
                <AnimateHeight
                    duration={expansionAnimationDuration}
                    height={height}
                    id={`folder-items-${id}`}
                >
                    {children ? (
                        children
                    ) : (
                        <TreeItem
                            {...TreeItemProps}
                            depth={TreeItemProps.depth + 1}
                            id="EMPTY-FOLDER"
                            isDisabled
                            label="This folder is empty"
                        />
                    )}
                </AnimateHeight>
            </div>
        );
    }
);

Folder.displayName = "Folder";

export default Folder;

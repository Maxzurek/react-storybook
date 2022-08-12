import "./Folder.scss";

import { forwardRef, useImperativeHandle, useState } from "react";
import TreeItem, { ITreeItemRef, TreeItemProps } from "./TreeItem";
import OpenedFolder from "../../../icons/OpenedFolder.icon";
import ClosedFolder from "../../../icons/ClosedFolder.icon";
import {
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useRefCallback from "../../../hooks/useRefCallback";
import AnimateHeight, { Height } from "react-animate-height";
import { flushSync } from "react-dom";

export interface IFolderRef {
    openFolder: () => void;
    closeFolder: () => void;
    isFolderOpen: () => boolean;
    setFocusAndEdit: () => void;
    focus: () => void;
    scrollIntoView: () => void;
    scrollTop: () => void;
}

export interface FolderProps
    extends Omit<TreeItemProps, "icon" | "leftAdornment" | "rightAdornment"> {
    children?: JSX.Element[];
}

const Folder = forwardRef<IFolderRef, FolderProps>(
    ({ children, ...TreeItemProps }: FolderProps, ref) => {
        const { id } = TreeItemProps;

        const {
            getRef: getTreeItemRef,
            setRefCallback: setTreeItemRefCallback,
        } = useRefCallback<ITreeItemRef>();

        const [isOpen, setIsOpen] = useState(false);
        const [height, setHeight] = useState<Height>(0);

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
            openFolder: handleOpenFolder,
            closeFolder: handleCloseFolder,
            isFolderOpen: () => isOpen,
            setFocusAndEdit: () => {
                getTreeItemRef(id)?.setFocusAndEdit();
            },
            focus: () => {
                getTreeItemRef(id)?.focus();
            },
            scrollIntoView: () => {
                getTreeItemRef(id)?.scrollIntoView();
            },
            scrollTop: () => {
                getTreeItemRef(id)?.scrollTop();
            },
        }));

        const folderItemsClassNames = ["folder__items"];
        isOpen && folderItemsClassNames.push("folder__items--visible");

        return (
            <div className="folder">
                <TreeItem
                    {...TreeItemProps}
                    ref={setTreeItemRefCallback(id)}
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

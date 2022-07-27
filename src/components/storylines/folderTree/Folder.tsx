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

export interface IFolderRef {
    openFolder: () => void;
    closeFolder: () => void;
    isFolderOpen: () => boolean;
    setFocusAndEdit: () => void;
    focus: () => void;
}

export interface FolderProps
    extends Omit<TreeItemProps, "icon" | "leftAdornment" | "rightAdornment"> {
    children?: JSX.Element[];
}

const Folder = forwardRef<IFolderRef, FolderProps>(
    ({ children, ...TreeItemProps }: FolderProps, ref) => {
        const { id } = TreeItemProps;

        const [isOpen, setIsOpen] = useState(false);

        const {
            getRef: getTreeItemRef,
            setRefCallback: setTreeItemRefCallback,
        } = useRefCallback<ITreeItemRef>();

        const handleTreeItemClick = () => {
            setIsOpen(!isOpen);
            TreeItemProps.onItemSelected?.();
        };

        useImperativeHandle(ref, () => ({
            openFolder: () => {
                setIsOpen(true);
            },
            closeFolder: () => {
                setIsOpen(false);
            },
            isFolderOpen: () => isOpen,
            setFocusAndEdit: () => {
                getTreeItemRef(id)?.setFocusAndEdit();
            },
            focus: () => {
                getTreeItemRef(id)?.focus();
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
                    onItemSelected={handleTreeItemClick}
                />
                <div className={folderItemsClassNames.join(" ")}>
                    {children ? (
                        children
                    ) : (
                        <TreeItem
                            {...TreeItemProps}
                            depth={TreeItemProps.depth + 1}
                            id="EMPTY-FOLDER"
                            isDisabled
                            label="This folder is empty"
                            selectedParentFolderDepth={
                                TreeItemProps.selectedParentFolderDepth
                            }
                        />
                    )}
                </div>
            </div>
        );
    }
);

Folder.displayName = "Folder";

export default Folder;

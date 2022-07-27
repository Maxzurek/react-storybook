import "./FolderItem.scss";

import ReactIcon from "../../../icons/ReactIcon";
import TreeItem, { TreeItemProps, ITreeItemRef } from "./TreeItem";
import { forwardRef } from "react";

export type IFolderItemRef = ITreeItemRef;

export type FolderItemProps = Omit<
    TreeItemProps,
    "icon" | "leftAdornment" | "rightAdornment"
>;

const FolderItem = forwardRef<ITreeItemRef, FolderItemProps>(
    ({ id, label, depth, ...rest }: FolderItemProps, ref) => {
        return (
            <div className="folder-item">
                <TreeItem
                    ref={ref}
                    depth={depth}
                    icon={<ReactIcon />}
                    id={id}
                    label={label}
                    leftAdornment={<></>}
                    {...rest}
                />
            </div>
        );
    }
);

FolderItem.displayName = "FolderItem";
export default FolderItem;

import "./FolderItem.scss";

import ReactIcon from "../../../icons/ReactIcon";
import TreeItem, { TreeItemProps, TreeItemRef } from "./TreeItem";
import { forwardRef } from "react";

type FolderItemProps = Omit<TreeItemProps, "caretIconComponent">;

const FolderItem = forwardRef<TreeItemRef, FolderItemProps>((props, ref) => {
    return (
        <div className="folder-item">
            <TreeItem {...props} ref={ref} icon={props.icon ? props.icon : <ReactIcon />} />
        </div>
    );
});

FolderItem.displayName = "FolderItem";
export default FolderItem;

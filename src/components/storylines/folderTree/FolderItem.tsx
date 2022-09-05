import "./FolderItem.scss";

import ReactIcon from "../../../icons/ReactIcon";
import TreeItem, { TreeItemProps, TreeItemRef } from "./TreeItem";
import { forwardRef } from "react";

const FolderItem = forwardRef<TreeItemRef, TreeItemProps>((props, ref) => {
    return (
        <div className="folder-item">
            <TreeItem ref={ref} icon={<ReactIcon />} {...props} />
        </div>
    );
});

FolderItem.displayName = "FolderItem";
export default FolderItem;

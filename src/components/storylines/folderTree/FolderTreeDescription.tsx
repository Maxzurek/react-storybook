import "./FolderTreeDescription.scss";

const FolderTreeDescription = () => {
    return (
        <div className="folder-tree-description">
            <span className="folder-tree-description__list-header"> Shortcuts</span>
            <span className="folder-tree-description__list-header-suffix">
                (Folder tree needs to be focused for shortcuts to work)
            </span>
            <div className="folder-tree-description__list-container">
                <ul className="folder-tree-description__list folder-tree-description__list--visible-bullets">
                    <li>Navigate through folders:</li>
                    <li>Close folder:</li>
                    <li>Open folder:</li>
                    <li>Rename folder or folder item:</li>
                    <li>Apply rename:</li>
                    <li>Cancel rename:</li>
                </ul>
                <ul className="folder-tree-description__list">
                    <li>Arrow up/down</li>
                    <li>Arrow left</li>
                    <li>Arrow right</li>
                    <li>F2</li>
                    <li>Enter</li>
                    <li>Escape</li>
                </ul>
            </div>
            <div className="folder-tree-description__list-header">Features</div>
            <ul className="folder-tree-description__list folder-tree-description__list--visible-bullets">
                <li>Drag and drop any folder or folder item</li>
                <li>Use mouse right click on a folder or folder item to open the context menu</li>
                <li>Search and scroll to any folder item using the search bar</li>
            </ul>
        </div>
    );
};

export default FolderTreeDescription;

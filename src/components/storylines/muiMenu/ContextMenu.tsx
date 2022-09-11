import React, { forwardRef, useImperativeHandle } from "react";
import StorybookMenu, { StorybookMenuProps } from "./Menu";
import { ContextMenuPosition } from "./Menu.interfaces";

export interface ContextMenuRef {
    open: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    close: () => void;
}

type StorybookContextMenuProps = Omit<StorybookMenuProps, "button">;

const StorybookContextMenu = forwardRef<ContextMenuRef, StorybookContextMenuProps>(
    ({ children, onClose }: StorybookContextMenuProps, ref) => {
        const [contextMenuPosition, setContextMenuPosition] = React.useState<ContextMenuPosition>();

        useImperativeHandle(ref, () => ({
            open: handleOpen,
            close: handleClose,
        }));

        const handleOpen = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            e.preventDefault();
            setContextMenuPosition(
                !contextMenuPosition
                    ? {
                          x: e.clientX,
                          y: e.clientY,
                      }
                    : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                      // Other native context menus might behave different.
                      // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                      null
            );
        };

        const handleClose = () => {
            setContextMenuPosition(null);
            onClose?.();
        };

        return (
            <div>
                <StorybookMenu
                    anchorReference="anchorPosition"
                    contextMenuPosition={
                        contextMenuPosition
                            ? {
                                  x: contextMenuPosition.x,
                                  y: contextMenuPosition.y,
                              }
                            : undefined
                    }
                    onClose={handleClose}
                >
                    {children}
                </StorybookMenu>
            </div>
        );
    }
);

export default StorybookContextMenu;
StorybookContextMenu.displayName = "StorybookContextMenu";

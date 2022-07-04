/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Divider,
    ListItemText,
    MenuItem,
    MenuItemProps,
    Typography,
} from "@mui/material";
import { forwardRef, ReactNode } from "react";

export interface StorybookMenuItemProps extends MenuItemProps {
    label?: string;
    icon?: ReactNode;
    shortcut?: string;
    isOnlyVisibleInContextMenu?: boolean;
    disableCloseMenuOnClick?: boolean;
    withTopDivider?: boolean;
    withBottomDivider?: boolean;
}

const StorybookMenuItem = forwardRef<HTMLLIElement, StorybookMenuItemProps>(
    (
        {
            label,
            icon,
            shortcut,
            isOnlyVisibleInContextMenu,
            disableCloseMenuOnClick,
            withTopDivider,
            withBottomDivider,
            ...menuItemProps
        },
        ref
    ) => {
        return (
            <>
                {withTopDivider && <Divider />}
                <MenuItem
                    {...menuItemProps}
                    ref={ref}
                    className="storybook-menu-item"
                >
                    {menuItemProps.children ? (
                        menuItemProps.children
                    ) : (
                        <>
                            <ListItemText>{label}</ListItemText>
                            {icon}
                            {shortcut && <Typography>{shortcut}</Typography>}
                        </>
                    )}
                </MenuItem>
                {withBottomDivider && <Divider />}
            </>
        );
    }
);

StorybookMenuItem.displayName = "StorybookMenuItem";

export default StorybookMenuItem;

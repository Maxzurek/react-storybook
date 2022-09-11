/* eslint-disable @typescript-eslint/no-unused-vars */
import { Divider, ListItemText, MenuItem, MenuItemProps, Typography } from "@mui/material";
import { forwardRef, ReactNode } from "react";

export interface StorybookMenuItemProps extends MenuItemProps {
    /**
     * The id provided must be unique to ensure that the keyboard navigation works properly
     */
    id: string;
    icon?: ReactNode;
    shortcut?: string;
    disableCloseMenuOnClick?: boolean;
    withTopDivider?: boolean;
    withBottomDivider?: boolean;
}

const StorybookMenuItem = forwardRef<HTMLLIElement, StorybookMenuItemProps>(
    (
        {
            id,
            icon,
            shortcut,
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
                <MenuItem id={id} {...menuItemProps} ref={ref} className="storybook-menu-item">
                    {menuItemProps.children ? (
                        menuItemProps.children
                    ) : (
                        <>
                            <ListItemText>{menuItemProps.title}</ListItemText>
                            {icon}
                            {shortcut && <Typography ml={4}>{shortcut}</Typography>}
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

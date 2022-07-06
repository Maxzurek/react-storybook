import { MenuItemProps, DividerProps } from "@mui/material";
import { ReactElement, ReactFragment } from "react";
import { NestedMenuItemProps } from "./NestedMenuItem";

export type MenuItemElement = ReactElement<
    MenuItemProps | NestedMenuItemProps | DividerProps | ReactFragment
>;

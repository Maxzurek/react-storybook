export type MenuItemElement = JSX.Element | JSX.Element[];

export type MenuClosedReason = "backdropClick" | "escapeKeyDown" | "itemClick";

export interface ContextMenuPosition {
    x: number;
    y: number;
}

import { withClassNames } from "../../utilities/Html.utils";
import Checkbox from "../checkbox/Checkbox";
import "./SelectOption.scss";

import { ReactNode } from "react";

interface SelectOptionBaseProps<T> {
    label: string;
    value: T;
    theme?: "primary" | "secondary" | "accent";
    startAdornment?: ReactNode;
    isDisabled?: boolean;
}

interface SelectOptionNoCheckboxProps<T> extends SelectOptionBaseProps<T> {
    onClick?: (e: React.MouseEvent, value: T) => void;
}

interface SelectOptionCheckboxProps<T> extends SelectOptionBaseProps<T> {
    isChecked?: boolean;
    withCheckbox?: boolean;
    onChange?: (e: React.MouseEvent, value: T, isChecked: boolean) => void;
}

type SelectOptionProps<T> = SelectOptionNoCheckboxProps<T> & SelectOptionCheckboxProps<T>;

export function SelectOption<T>(props: SelectOptionNoCheckboxProps<T>): JSX.Element;
export function SelectOption<T>(props: SelectOptionCheckboxProps<T>): JSX.Element;
export function SelectOption<T>(props: SelectOptionProps<T>) {
    const {
        label,
        value,
        theme = "primary",
        isChecked,
        withCheckbox,
        startAdornment,
        isDisabled,
        onChange,
        onClick,
    } = props;
    const handleClick = (e: React.MouseEvent) => {
        if (withCheckbox) {
            const newIsChecked = !isChecked;
            onChange?.(e, value, newIsChecked);
        } else {
            onClick?.(e, value);
        }
    };

    return (
        <div
            className={withClassNames([
                "select-option",
                theme === "secondary" && "select-option--theme-secondary",
                theme === "accent" && "select-option--theme-accent",
                withCheckbox && "select-option--with-checkbox",
                isDisabled && "select-option--disabled",
            ])}
            onClick={handleClick}
        >
            {startAdornment}
            <div className="select-option__label">{label}</div>
            {withCheckbox && <Checkbox checked={isChecked} readOnly theme={theme} />}
        </div>
    );
}

import "./Checkbox.scss";

import { withClassNames } from "../../utilities/Html.utils";

interface CheckboxProps
    extends Omit<
        React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
        "type" | "size"
    > {
    /**
     * @default "primary"
     */
    theme?: "primary" | "secondary" | "accent";
    /**
     * @default "sm"
     */
    size?: "sm" | "md" | "lg";
}

const Checkbox = ({ theme, size, ...inputProps }: CheckboxProps) => {
    return (
        <input
            {...inputProps}
            className={withClassNames([
                "checkbox",
                theme === "secondary" && "checkbox--secondary",
                theme === "accent" && "checkbox--accent",
                size === "md" && "checkbox--md",
                size === "lg" && "checkbox--lg",
                inputProps.className,
            ])}
            type="checkbox"
        />
    );
};

export default Checkbox;

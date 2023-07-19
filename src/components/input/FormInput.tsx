import "./FormInput.scss";

import { withClassNames } from "../../utilities/Html.utils";
import FormControlBase, { FormControlBaseProps } from "../formControl/FormControlBase";

import { LegacyRef, ReactNode, forwardRef, useState } from "react";

interface InputBaseProps {
    /**
     * Styles applied to the endAdornment element.
     */
    endAdornment?: ReactNode;
    inputRef?: LegacyRef<HTMLInputElement>;
}

type InputProps = InputBaseProps &
    Omit<FormControlBaseProps, "isLabelRaised"> &
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const FormInput = forwardRef<HTMLDivElement, InputProps>(
    (
        {
            theme = "primary",
            label,
            errorMessage,
            isError,
            animationDuration = 250,
            endAdornment,
            className,
            inputRef,
            ...inputProps
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);

        const handleFocusInput = (e: React.FocusEvent<HTMLInputElement, Element>) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
        };

        const handleBlurInput = (e: React.FocusEvent<HTMLInputElement, Element>) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
        };

        return (
            <FormControlBase
                ref={ref}
                animationDuration={animationDuration}
                className={withClassNames([className, "form-input"])}
                errorMessage={errorMessage}
                isError={isError}
                isLabelRaised={isFocused || !!inputProps.value}
                label={label}
                theme={theme}
            >
                <input
                    ref={inputRef}
                    {...inputProps}
                    onBlur={handleBlurInput}
                    onFocus={handleFocusInput}
                />
                {endAdornment}
            </FormControlBase>
        );
    }
);

FormInput.displayName = "FormInput";
export default FormInput;

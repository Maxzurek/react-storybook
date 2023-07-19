import "./FormControlBase.scss";

import { withClassNames } from "../../utilities/Html.utils";
import { HTMLAttributes, forwardRef } from "react";

export interface FormControlBaseProps {
    theme?: "primary" | "secondary" | "accent";
    label?: string;
    isLabelRaised?: boolean;
    errorMessage?: string;
    isError?: boolean;
    /**
     * The duration of the animations in milliseconds
     * @default 250
     */
    animationDuration?: number;
    /**
     * @default "outline"
     */
    variant?: "standard" | "outline";
}

type FormControlBasePropsWithHTMLDivAttributes = FormControlBaseProps &
    HTMLAttributes<HTMLDivElement>;

const FormControlBase = forwardRef<HTMLDivElement, FormControlBasePropsWithHTMLDivAttributes>(
    (
        {
            theme = "primary",
            label,
            isLabelRaised,
            errorMessage,
            isError,
            animationDuration = 250,
            variant,
            ...divProps
        },
        ref
    ) => {
        const handleDivRefCallback = (node: HTMLDivElement) => {
            if (ref) {
                if (typeof ref === "function") {
                    ref(node);
                } else {
                    ref.current = node;
                }
            }

            if (!node) return;

            const width = node.clientWidth;
            node.style.setProperty("--form-control-base-width", `${width}px`);
            node.style.setProperty(
                "--form-control-base-animation-duration",
                `${animationDuration / 1000}s`
            );
        };

        const handleErrorRefCallback = (node: HTMLDivElement) => {
            if (!node) return;

            const height = node.scrollHeight;
            const width = node.scrollHeight;

            node.style.setProperty("--form-control-base-error-height", `${height}px`);
            node.style.setProperty("--form-control-base-error-width", `${width}px`);
        };

        return (
            <div
                ref={handleDivRefCallback}
                {...divProps}
                className={withClassNames([
                    divProps.className,
                    "form-control-base",
                    theme === "secondary" && "form-control-base--theme-secondary",
                    theme === "accent" && "form-control-base--theme-accent",
                    label && isLabelRaised && "form-control-base--label-raised",
                    isError && "form-control-base--error",
                    variant === "standard" && "form-control-base--standard",
                ])}
            >
                {label && (
                    <>
                        <div
                            className={withClassNames([
                                "form-control-base__label",
                                isError && "form-control-base__label--error",
                            ])}
                        >
                            {label}
                        </div>
                        <fieldset
                            className={withClassNames([
                                "form-control-base__outline",
                                isError && "form-control-base__outline--error",
                            ])}
                        >
                            <legend>
                                <span>{label}</span>
                            </legend>
                        </fieldset>
                    </>
                )}
                {divProps.children}
                {isError && errorMessage && (
                    <div ref={handleErrorRefCallback} className="form-control-base__error">
                        {errorMessage}
                    </div>
                )}
            </div>
        );
    }
);

FormControlBase.displayName = "FormControlBase";
export default FormControlBase;

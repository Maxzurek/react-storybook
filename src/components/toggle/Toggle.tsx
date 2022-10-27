import { forwardRef, useState } from "react";
import "./Toggle.scss";

export type ToggleSize = "small" | "medium" | "large";

interface ToggleProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    isOn?: boolean;
    size?: ToggleSize;
    htmlFor?: string;
    isDisabled?: boolean;
    /**
     * The animation duration of the sliding effect in milliseconds.
     * @default 250
     */
    toggleAnimationDuration?: number;
    onToggle?: (isOn: boolean) => void;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
    (
        {
            isOn: isOnControlled,
            size = "small",
            htmlFor,
            isDisabled,
            toggleAnimationDuration = 250,
            onToggle,
            ...inputProps
        },
        ref
    ) => {
        const [isOn, setIsOn] = useState(false);

        const handleToggleChanged = (isOn: boolean) => {
            onToggle?.(isOn);
            isOnControlled ?? setIsOn(isOn);
        };

        const switchClassNames = ["toggle__switch"];
        size === "medium" && switchClassNames.push("toggle__switch--md");
        size === "large" && switchClassNames.push("toggle__switch--lg");
        isDisabled && switchClassNames.push("toggle__switch--disabled");

        const sliderClassNames = ["toggle__slider"];
        size === "medium" && sliderClassNames.push("toggle__slider--md");
        size === "large" && sliderClassNames.push("toggle__slider--lg");
        isDisabled && sliderClassNames.push("toggle__slider--disabled");

        const handleToggleRefCallback = (node: HTMLInputElement) => {
            if (node) {
                node.style.setProperty(
                    "--toggle-animation-duration",
                    `${toggleAnimationDuration / 1000}s`
                );
            }
        };

        return (
            <div ref={handleToggleRefCallback} className="toggle">
                <label className={switchClassNames.join(" ")}>
                    <input
                        ref={ref}
                        checked={isOnControlled ? isOnControlled : isOn}
                        disabled={isDisabled}
                        id={htmlFor}
                        type="checkbox"
                        onChange={(e) => handleToggleChanged(e.target.checked)}
                        {...inputProps}
                    />
                    <span className={sliderClassNames.join(" ")}></span>
                </label>
            </div>
        );
    }
);

Toggle.displayName = "Toggle";
export default Toggle;

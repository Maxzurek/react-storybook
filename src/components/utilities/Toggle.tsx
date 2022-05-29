import { useState } from "react";
import "./Toggle.scss";

export type ToggleSize = "small" | "medium" | "large";

interface ToggleProps {
    isOn?: boolean;
    size?: ToggleSize;
    htmlFor?: string;

    onToggle?: (isOn: boolean) => void;
}

Toggle.defaultProps = {
    size: "small",
};

export default function Toggle({
    isOn: isOnControled,
    size,
    htmlFor,
    onToggle,
}: ToggleProps) {
    const [isOn, setIsOn] = useState(false);

    const handleToggleChanged = (isOn: boolean) => {
        onToggle?.(isOn);
        isOnControled ?? setIsOn(isOn);
    };

    const switchClassNames = ["toggle__switch"];
    size === "medium" && switchClassNames.push("toggle__switch--md");
    size === "large" && switchClassNames.push("toggle__switch--lg");

    const sliderClassNames = ["toggle__slider"];
    size === "medium" && sliderClassNames.push("toggle__slider--md");
    size === "large" && sliderClassNames.push("toggle__slider--lg");

    return (
        <div className="toggle">
            <label className={switchClassNames.join(" ")}>
                <input
                    checked={isOnControled ? isOnControled : isOn}
                    id={htmlFor}
                    type="checkbox"
                    onChange={(e) => handleToggleChanged(e.target.checked)}
                />
                <span className={sliderClassNames.join(" ")}></span>
            </label>
        </div>
    );
}

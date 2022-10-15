import "./ExpandableDiv.scss";

import { ReactNode, useRef } from "react";
import React from "react";
import { usePrevious } from "../../../hooks/usePrevious";

interface ExpandableDivProps
    extends Omit<
        React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLImageElement>,
        "className"
    > {
    isExpanded: boolean;
    animationDuration?: number;
    children?: ReactNode;
    className?: string;
}

export default function ExpandableDiv({
    isExpanded,
    animationDuration = 0.3,
    children,
    className,
    ...divElementProps
}: ExpandableDivProps) {
    const prevIsExpanded = usePrevious(isExpanded);
    const isTouched = prevIsExpanded !== undefined && prevIsExpanded !== isExpanded;

    const expandableDivScrollHeightRef = useRef<number>();

    const handleExpandableDivCallback = (node: HTMLDivElement) => {
        if (node) {
            const expandableDivScrollHeight = node.scrollHeight;

            expandableDivScrollHeightRef.current = expandableDivScrollHeight;
            node.style.setProperty("--height", `${expandableDivScrollHeight.toString()}px`);
            node.style.setProperty("--animation-duration", `${animationDuration.toString()}s`);
        }
    };

    const expandableDivClassNames = [
        "expandable-div",
        className,
        !isTouched && isExpanded && "expandable-div--expanded-preload",
        !isTouched && !isExpanded && "expandable-div--collapsed-preload",
        isTouched && isExpanded && "expandable-div--expanded",
        isTouched && !isExpanded && "expandable-div--collapsed",
    ].filter(Boolean);

    return (
        <div
            ref={handleExpandableDivCallback}
            className={expandableDivClassNames.join(" ")}
            {...divElementProps}
        >
            {children}
        </div>
    );
}

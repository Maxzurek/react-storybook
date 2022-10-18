import "./ExpandableDiv.scss";

import { forwardRef, ReactNode, useRef } from "react";
import React from "react";
import { usePrevious } from "../../../hooks/usePrevious";

export type ExpansionDirection = "vertical" | "horizontal" | "diagonal";

interface ExpandableDivProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    isExpanded: boolean;
    children?: ReactNode;
    /**
     * The direction of the expansion animation
     * @default vertical
     */
    expansionDirection?: ExpansionDirection;
    /**
     * If set to true, when rendering the component for the first time, the expansion or collapse animation will play.
     */
    isInitialAnimationEnabled?: boolean;
    /**
     * The duration of the expansion and collapse animation.
     */
    animationDuration?: number;
    /**
     * Set how the animation progresses through the duration of it's cycles.
     */
    animationTimingFunction?: "ease" | "ease-in" | "ease-in-out" | "ease-out";
}

const ExpandableDiv = forwardRef<HTMLDivElement, ExpandableDivProps>(
    (
        {
            isExpanded,
            children,
            expansionDirection = "vertical",
            isInitialAnimationEnabled,
            animationDuration = 0.3,
            animationTimingFunction,
            ...divElementProps
        },
        ref
    ) => {
        const prevIsExpanded = usePrevious(isExpanded);

        const expandableDivRef = useRef<HTMLDivElement>();
        const isTouched = useRef(false);

        const hasBeenExpandedOrCollapsed =
            prevIsExpanded !== undefined && prevIsExpanded !== isExpanded;

        if (!isTouched.current && hasBeenExpandedOrCollapsed) {
            isTouched.current = true;
        }

        if (expandableDivRef.current && !isExpanded) {
            expandableDivRef.current.style.setProperty(
                "--max-height",
                `${expandableDivRef.current.scrollHeight.toString()}px`
            );
        }

        const handleForwardRef = (node: HTMLDivElement) => {
            if (ref) {
                if (typeof ref === "function") {
                    ref(node);
                } else {
                    ref.current = node;
                }
            }
        };

        const handleExpandableDivRefCallback = (node: HTMLDivElement) => {
            if (node) {
                expandableDivRef.current = node;
                handleForwardRef(node);

                node.style.setProperty("--max-height", `${node.scrollHeight.toString()}px`);
                node.style.setProperty("--animation-duration", `${animationDuration.toString()}s`);
                node.style.setProperty("--animation-timing-function", animationTimingFunction);
            }
        };

        const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
            if (!expandableDivRef.current || !isExpanded) {
                divElementProps.onAnimationEnd?.(e);
                return;
            }

            if (expansionDirection === "vertical" || expansionDirection === "diagonal") {
                expandableDivRef.current.style.setProperty("--max-height", "auto");
            }

            divElementProps.onAnimationEnd?.(e);
        };

        const expandableDivClassNames = [
            "expandable-div",
            divElementProps.className,
            !isInitialAnimationEnabled &&
                !isTouched.current &&
                isExpanded &&
                `expandable-div--expanded-${expansionDirection}ly-untouched`,
            !isInitialAnimationEnabled &&
                !isTouched.current &&
                !isExpanded &&
                `expandable-div--collapsed-${expansionDirection}ly-untouched`,
            (isTouched.current || isInitialAnimationEnabled) &&
                isExpanded &&
                `expandable-div--expanded-${expansionDirection}ly`,
            (isTouched.current || isInitialAnimationEnabled) &&
                !isExpanded &&
                `expandable-div--collapsed-${expansionDirection}ly`,
        ].filter(Boolean);

        return (
            <div
                ref={handleExpandableDivRefCallback}
                {...divElementProps}
                className={expandableDivClassNames.join(" ")}
                onAnimationEnd={handleAnimationEnd}
            >
                {children}
            </div>
        );
    }
);

ExpandableDiv.displayName = "ExpandableDiv";
export default ExpandableDiv;

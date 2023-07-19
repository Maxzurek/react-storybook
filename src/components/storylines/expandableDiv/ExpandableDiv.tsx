import "./ExpandableDiv.scss";

import { forwardRef, ReactNode, useRef } from "react";
import React from "react";
import { usePrevious } from "../../../hooks/usePrevious";
import { withClassNames } from "../../../utilities/Html.utils";

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
     * The duration of the expansion and collapse animation, in milliseconds.
     * @default 250
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
            animationDuration = 250,
            animationTimingFunction,
            ...divElementProps
        },
        ref
    ) => {
        const prevIsExpanded = usePrevious(isExpanded);
        const prevAnimationDuration = usePrevious(animationDuration);
        const expandableDivRef = useRef<HTMLDivElement>();
        const isTouched = useRef(false);
        const isRefAttached = useRef(false);

        const hasBeenExpandedOrCollapsed =
            prevIsExpanded !== undefined && prevIsExpanded !== isExpanded;

        if (expandableDivRef.current && prevAnimationDuration !== animationDuration) {
            expandableDivRef.current.style.setProperty(
                "--animation-duration",
                `${(animationDuration / 1000).toString()}s`
            );
        }
        if (!isTouched.current && (hasBeenExpandedOrCollapsed || isRefAttached.current)) {
            isTouched.current = true;
        }
        if (expandableDivRef.current && !isExpanded && prevIsExpanded !== isExpanded) {
            expandableDivRef.current.style.setProperty(
                "--expandable-div-height",
                `${expandableDivRef.current.scrollHeight.toString()}px`
            );
            expandableDivRef.current.style.setProperty(
                "--expandable-div-width",
                `${expandableDivRef.current.scrollWidth.toString()}px`
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
            if (!isRefAttached.current && node) {
                isRefAttached.current = true;
                expandableDivRef.current = node;

                handleForwardRef(node);

                node.style.setProperty(
                    "--animation-duration",
                    `${(animationDuration / 1000).toString()}s`
                );
                node.style.setProperty(
                    "--expandable-div-height",
                    `${node.scrollHeight.toString()}px`
                );
                node.style.setProperty(
                    "--expandable-div-width",
                    `${expandableDivRef.current.scrollWidth.toString()}px`
                );
                node.style.setProperty("--animation-timing-function", animationTimingFunction);
            }
        };

        const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
            if (!expandableDivRef.current || !isExpanded) {
                divElementProps.onTransitionEnd?.(e);
                return;
            }

            if (expansionDirection === "vertical" || expansionDirection === "diagonal") {
                expandableDivRef.current.style.setProperty("--expandable-div-height", "auto");
                expandableDivRef.current.style.setProperty("--expandable-div-width", "auto");
            }

            if (e.target === expandableDivRef.current) {
                divElementProps.onTransitionEnd?.(e);
            }
        };

        return (
            <div
                ref={handleExpandableDivRefCallback}
                {...divElementProps}
                className={withClassNames([
                    divElementProps.className,
                    "expandable-div",
                    (isTouched.current || isInitialAnimationEnabled) &&
                        !isExpanded &&
                        "expandable-div--collapsed",
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
                ])}
                onTransitionEnd={handleTransitionEnd}
            >
                {children}
            </div>
        );
    }
);

ExpandableDiv.displayName = "ExpandableDiv";
export default ExpandableDiv;

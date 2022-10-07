import { useCallback, useEffect, useRef } from "react";

export interface ScrollUntilVisibleOptions {
    scrollArgs?: boolean | ScrollIntoViewOptions;
    /**
     * The percentage ration of the element  visibility needed to determine if the element is intersecting.
     * @default 0.01
     */
    intersectionRatio?: number;
    /**
     * The maximum period of time to attempt to scroll to the element.
     * @default: 3000 milliseconds
     */
    maxAttemptPeriod?: number;
    /**
     * If true, the observer will be disconnected when a mouse wheel or a touch move event is detected.
     * @default: false
     */
    isAbortOnWheelEventDisabled?: boolean;
}

const defaultOptions: ScrollUntilVisibleOptions = {
    intersectionRatio: 0.01,
    maxAttemptPeriod: 3000,
    isAbortOnWheelEventDisabled: false,
};

/**
 * This hook provides a way to attempt to scroll to an element until is it visible, but for a certain period of time (3000 milliseconds by default).
 * It uses the Intersection Observer API to observe the element provided.
 * It will scroll the element into view whenever the element is not moving,
 * and if the element is intersecting (visible in the viewport), the observer will be disconnected.
 * This hook assumes that the element provided has been attached to it's ref.
 * Prefer using this hook when the goal is to scroll to an element while using css transition(s) and/or animation(s).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
const useScrollWithIntersectionObserver = () => {
    const observerRef = useRef<IntersectionObserver>();
    const timeout = useRef<NodeJS.Timeout>();
    const intervalCountRef = useRef(0);
    const lastTopPosition = useRef(undefined);
    const lastBottomPosition = useRef(undefined);
    const wasWheelEventDetected = useRef(false);
    const isDevEnvironnement = useRef(
        !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    );

    /**
     * This variable determines the rate at which the observer disconnects, attempt to scroll to the element and reconnects.
     */
    const intervalDelay = 50;

    const abortOnWheelEvent = useCallback(() => {
        wasWheelEventDetected.current = true;
        window.removeEventListener("wheel", abortOnWheelEvent);
        window.removeEventListener("touchmove", abortOnWheelEvent);
    }, []);

    const reset = useCallback(() => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        clearTimeout(timeout.current);
        timeout.current = null;
        intervalCountRef.current = 0;
        lastTopPosition.current = 0;
        wasWheelEventDetected.current = false;
        window.removeEventListener("wheel", abortOnWheelEvent);
        window.removeEventListener("touchmove", abortOnWheelEvent);
    }, [abortOnWheelEvent]);

    const logWarning = (message: string) => {
        if (isDevEnvironnement) {
            console.warn(message);
        }
    };

    // Clean reset when the component is unmounted
    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    /**
     * Will attempt to scroll the provided element into view until the max attempt period is reached.
     * Will return a promise after successfully scrolling to the element.
     */
    const scrollToUntilVisible = async (
        element: HTMLElement,
        options?: ScrollUntilVisibleOptions
    ): Promise<HTMLElement> => {
        return new Promise((resolve) => {
            const optionsWithDefault = { ...defaultOptions, ...options };

            const observerCallback: IntersectionObserverCallback = (entries, observer) => {
                /**
                 * Disconnect the observer after first connecting it.
                 * It will be reconnected later if needed.
                 */
                observer.disconnect();

                /**
                 * Max intervals before stopping any attempt to scroll to the element and disconnection the observer
                 */
                const maxIntervals = optionsWithDefault.maxAttemptPeriod / intervalDelay;
                const entry = entries?.[0];

                if (!entry) {
                    logWarning(
                        "useScrollUntilVisible: No element detected. The ref that provided the element might not be attached yet."
                    );
                    reset();
                    return;
                } else if (wasWheelEventDetected.current) {
                    logWarning(
                        "useScrollUntilVisible: scrollToUntilVisible aborted. Wheel event detected while attempting to scroll to the element provided." +
                            "If you wish to disable this feature, set isAbortOnWheelEventDisabled to true in the options"
                    );
                    reset();
                    return;
                } else if (intervalCountRef.current++ >= maxIntervals) {
                    logWarning(
                        "useScrollUntilVisible: scrollToUntilVisible aborted. Attempt period exceeded it's maximum allowed." +
                            "Consider increasing the maxAttemptPeriod or the intersection ratio in the options if the problem persists."
                    );
                    reset();
                    return;
                }

                const isElementMoving =
                    entry?.boundingClientRect.top !== lastTopPosition.current &&
                    entry?.boundingClientRect.bottom !== lastBottomPosition.current;

                if (!isElementMoving) {
                    element.scrollIntoView(optionsWithDefault.scrollArgs);
                }

                if (entry.intersectionRatio < optionsWithDefault.intersectionRatio) {
                    lastTopPosition.current = entry?.boundingClientRect.top;
                    lastBottomPosition.current = entry?.boundingClientRect.bottom;

                    timeout.current = setTimeout(() => {
                        observerRef.current?.observe(element);
                    }, intervalDelay);
                } else {
                    reset();
                    resolve(element);
                }
            };

            if (observerRef.current) {
                reset();
            }

            /**
             * We need to attach the eventListener to the window before connecting the observer.
             */
            if (!optionsWithDefault.isAbortOnWheelEventDisabled) {
                queueMicrotask(() => {
                    window.addEventListener("wheel", abortOnWheelEvent);
                    window.addEventListener("touchmove", abortOnWheelEvent);
                });
            }

            const observer = new IntersectionObserver(observerCallback, {
                root: null, // use the viewport
                rootMargin: "0px",
                threshold: 1.0,
            });

            observerRef.current = observer;
            observer.observe(element);
        });
    };

    return { scrollToUntilVisible };
};

export default useScrollWithIntersectionObserver;

import { useCallback, useEffect, useRef } from "react";

export interface ScrollUntilVisibleOptions {
    scrollArgs?: boolean | ScrollIntoViewOptions;
    /**
     * Callback executed after successfully scrolling to the element provided
     */
    onScrollSuccessful?: (element: HTMLElement) => void;
    /**
     * The minimum degree of intersection between the target element and the viewport for the element to considered visible
     * Default: 1 (100%)
     */
    intersectionRatio?: number;
    /**
     * The maximum period of time to attempt to scroll to the element.
     * Default: 3000 milliseconds
     */
    maxAttemptPeriod?: number;
    /**
     * If true, the hook will abort any attempt to scroll to the provided element when a wheel event is detected (Mouse up or down
     * Default: false)
     */
    isAbortOnWheelEventDisabled?: boolean;
}

const defaultOptions: ScrollUntilVisibleOptions = {
    intersectionRatio: 1,
    maxAttemptPeriod: 3000,
    isAbortOnWheelEventDisabled: false,
};

/**
 * This hook will attempt to scroll to an element for a certain period of time (5 seconds by default) until is it visible.
 * It uses the Intersection Observer API to observe the element provided and detect if it is visible or moving.
 * This hook assumes that the react ref that provides the html element has been attached to the element.
 * Prefer using this hook when the goal is to scroll to an element while css transitions and or animations are happening at the same time.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
const useScrollUntilVisible = () => {
    const observerRef = useRef<IntersectionObserver>();
    const intervalCountRef = useRef(0);
    const lastTopPosition = useRef(undefined);
    const wheelEventWasDetected = useRef(false);
    const isDevEnvironnement = useRef(
        !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    );

    /**
     * This variable determines the rate at which the observer disconnects, attempt to scroll to the element and reconnects.
     */
    const intervalDelay = 20;

    const abortOnWheelEvent = useCallback(() => {
        wheelEventWasDetected.current = true;
        window.removeEventListener("wheel", abortOnWheelEvent);
        window.removeEventListener("touchmove", abortOnWheelEvent);
    }, []);

    const reset = useCallback(() => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        intervalCountRef.current = 0;
        lastTopPosition.current = 0;
        wheelEventWasDetected.current = false;
        window.removeEventListener("wheel", abortOnWheelEvent);
        window.removeEventListener("touchmove", abortOnWheelEvent);
    }, [abortOnWheelEvent]);

    const logWarning = useCallback((message: string) => {
        if (isDevEnvironnement) {
            console.warn(message);
        }
    }, []);

    // Clean reset when the component is unmounted
    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    const scrollToElement = useCallback(
        (element: HTMLElement, options?: ScrollUntilVisibleOptions) => {
            const optionsWithDefault = { ...defaultOptions, ...options };

            const observerCallback: IntersectionObserverCallback = (
                entries,
                observer
            ) => {
                /**
                 * Disconnect the observer after first connecting it.
                 * It will be reconnected later if needed.
                 */
                observer.disconnect();

                /**
                 * Max intervals before stopping any attempt to scroll to the element and disconnection the observer
                 */
                const maxIntervals =
                    optionsWithDefault.maxAttemptPeriod / intervalDelay;
                const entry = entries?.[0];

                if (!entry) {
                    logWarning(
                        "useScrollUntilVisible: No element detected. The ref that provided the element might not be attached yet."
                    );
                    reset();
                    return;
                } else if (wheelEventWasDetected.current) {
                    logWarning(
                        "useScrollUntilVisible: scrollToElement aborted. Wheel event detected while attempting to scroll to the element provided." +
                            "If you wish to disable this feature, set isAbortOnWheelEventDisabled to true in the options"
                    );
                    reset();
                    return;
                } else if (intervalCountRef.current++ >= maxIntervals) {
                    logWarning(
                        "useScrollUntilVisible: scrollToElement aborted. Attempt period exceeded it's maximum allowed." +
                            "Consider reducing the intersection ratio or increasing the maxAttemptPeriod in the options if the problem persists."
                    );
                    reset();
                    return;
                }

                const isElementMoving =
                    entry?.boundingClientRect.top !== lastTopPosition.current;

                if (!isElementMoving) {
                    element.scrollIntoView(optionsWithDefault.scrollArgs);
                }

                if (
                    entry.intersectionRatio <
                        optionsWithDefault.intersectionRatio ||
                    isElementMoving
                ) {
                    lastTopPosition.current = entry?.boundingClientRect.top;

                    setTimeout(() => {
                        observer.observe(element);
                    }, intervalDelay);
                } else {
                    reset();
                    optionsWithDefault.onScrollSuccessful?.(element);
                }
            };

            /**
             * We need to attach the eventListener to the window before connecting the observer.
             * setTimeout will ensure that these micro tasks are executed before connecting the observer
             */
            if (!optionsWithDefault.isAbortOnWheelEventDisabled) {
                setTimeout(() => {
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
        },
        [abortOnWheelEvent, logWarning, reset]
    );

    return { scrollToElement };
};

export default useScrollUntilVisible;

import { useCallback, useEffect, useRef, useState } from "react";

export type DomManipulation =
    | "scrollIntoView"
    | "scrollIntoViewSmooth"
    | "scrollBottom"
    | "scrollIntoViewAndSelect";

const useManipulateDomWhenVisible = () => {
    const [observer, setObserver] = useState<IntersectionObserver>();

    const intervalCountRef = useRef(0);

    useEffect(() => {
        return () => {
            observer?.disconnect();
        };
    }, [observer]);

    const fire = useCallback(
        (
            element: HTMLElement,
            action: DomManipulation,
            /**
             * Default: 250 milliseconds, or 0.25 second
             */
            intervalDelay = 250,
            /**
             * The maximum number of attempt to manipulate the DOM before disconnecting the observer.
             * Default: 16 = (intervalDelay * maxInterval) seconds
             */
            maxInterval = 16
        ) => {
            const observerCallback: IntersectionObserverCallback = (
                entries,
                observer
            ) => {
                observer.disconnect();

                if (intervalCountRef.current++ > maxInterval) {
                    console.log("Max interval reached");
                    intervalCountRef.current = 0;
                    return;
                }

                const entry = entries?.[0];

                if (!entry) {
                    throw Error(
                        "No entries detected. Make sure the observer have an observee"
                    );
                }
                if (
                    action === "scrollIntoViewAndSelect" &&
                    !("select" in element)
                ) {
                    throw Error(
                        `Action: '${action}' is not supported for the element: ${element} provided. Use an HTMLInputElement`
                    );
                }

                switch (action) {
                    case "scrollIntoView":
                        entry.target.scrollIntoView();
                        break;
                    case "scrollIntoViewSmooth":
                        entry.target.scrollIntoView({ behavior: "smooth" });
                        break;
                    case "scrollBottom":
                        entry.target.scrollIntoView({ block: "end" });
                        break;
                    case "scrollIntoViewAndSelect":
                        entry.target.scrollIntoView({ behavior: "smooth" });
                        (entry.target as HTMLInputElement).select();
                        break;
                    default:
                        throw Error(`Unsupported action ${action}`);
                }

                if (entry.intersectionRatio < 1) {
                    setTimeout(() => {
                        observer.observe(element);
                    }, intervalDelay);
                } else {
                    intervalCountRef.current = 0;
                }
            };

            const observer = new IntersectionObserver(observerCallback, {
                root: null, // use the viewport
                rootMargin: "0px",
                threshold: 1.0,
            });

            setObserver(observer);
            observer.observe(element);
        },
        []
    );

    return { fire };
};

export default useManipulateDomWhenVisible;

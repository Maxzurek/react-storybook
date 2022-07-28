import { useCallback, useEffect, useState } from "react";

export type DomManipulation =
    | "scrollIntoView"
    | "scrollIntoViewSmooth"
    | "scrollBottom"
    | "scrollIntoViewAndSelect";

const useManipulateDomWhenVisible = () => {
    const [observer, setObserver] = useState<IntersectionObserver>();

    useEffect(() => {
        return () => {
            observer?.disconnect();
        };
    }, [observer]);

    const fire = useCallback(
        (
            element: HTMLElement,
            action: DomManipulation,
            intervalDelay = 250
        ) => {
            const observerCallback: IntersectionObserverCallback = (
                entries,
                observer
            ) => {
                const entry = entries?.[0];
                observer.disconnect();

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

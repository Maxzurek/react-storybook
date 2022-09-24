import { useRef } from "react";

function useIntersectionObserver<T extends HTMLElement>() {
    const observer = useRef<IntersectionObserver>();
    const isIntersectingRef = useRef(false);

    /**
     * Observer the node provided using the IntersectionObserver.
     * As soon as the node is intersecting, the action callback provided will be invoked and the observer will be disconnected.
     *
     * @param node - the element to observe
     * @param action callback
     * @param intersectionThreshold default: 0.01 (which means the action callback will be invoked if at least 1% of the node is visible in the viewport)
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
     */
    const onNodeIntersecting = (
        node: T,
        action: (node: T) => void,
        intersectionThreshold = 0.01
    ) => {
        const observerCallback: IntersectionObserverCallback = (entries, observer) => {
            const entry = entries?.[0];

            if (entry.isIntersecting) {
                observer.disconnect();
                isIntersectingRef.current = true;
                action(node);
            }
        };

        observer.current?.disconnect();
        observer.current = new IntersectionObserver(observerCallback, {
            root: null, // use the viewport
            rootMargin: "0px",
            threshold: intersectionThreshold,
        });

        observer.current.observe(node);
    };
    const isIntersecting = isIntersectingRef.current;

    return { isIntersecting, onNodeIntersecting };
}

export default useIntersectionObserver;

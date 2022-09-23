import { useRef } from "react";

function useIntersectionObserver<T extends HTMLElement>() {
    const observer = useRef<IntersectionObserver>();
    const isIntersecting = useRef(false);

    /**
     * Observer the node provided using the IntersectionObserver.
     * As soon as the node is intersecting, the action callback provided will be invoked and the observer will be disconnected.
     * @param node
     * @param action
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
     */
    const onNodeIntersecting = (node: T, action: (node: T) => void) => {
        const observerCallback: IntersectionObserverCallback = (entries, observer) => {
            const entry = entries?.[0];

            if (entry.isIntersecting) {
                observer.disconnect();
                isIntersecting.current = true;
                action(node);
            }
        };

        observer.current?.disconnect();
        observer.current = new IntersectionObserver(observerCallback, {
            root: null, // use the viewport
            rootMargin: "0px",
            threshold: 1.0,
        });

        observer.current.observe(node);
    };

    return { onNodeIntersecting };
}

export default useIntersectionObserver;

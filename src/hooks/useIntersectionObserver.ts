import { useRef } from "react";

function useIntersectionObserver<T extends HTMLElement>() {
    const observer = useRef<IntersectionObserver>();
    const isIntersecting = useRef(false);

    const observeNodeIntersection = (
        node: T,
        onNodeIntersecting: (node: T) => void,
        disconnectWhenIntersecting = true
    ) => {
        const observerCallback: IntersectionObserverCallback = (entries, observer) => {
            const entry = entries?.[0];

            if (entry.isIntersecting) {
                if (disconnectWhenIntersecting) {
                    observer.disconnect();
                }
                isIntersecting.current = true;
                onNodeIntersecting(node);
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

    return { observeNodeIntersection };
}

export default useIntersectionObserver;

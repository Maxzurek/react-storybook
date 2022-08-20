import { useMemo, useEffect, useRef } from "react";

const useIsInViewport = (element: HTMLElement) => {
    const isIntersecting = useRef(false);

    const observer = useMemo(
        () =>
            new IntersectionObserver(
                ([entry]) => (isIntersecting.current = entry.isIntersecting)
            ),
        []
    );

    useEffect(() => {
        if (element) {
            observer.observe(element);
        }

        return () => {
            observer?.disconnect();
        };
    }, [observer, element]);

    const isInViewport = () => isIntersecting.current;

    return { isInViewport };
};

export default useIsInViewport;

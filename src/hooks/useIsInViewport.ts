import { useMemo, useEffect, useRef } from "react";

/**
 * This hook provides a way to determine if an html element is visible in the viewport.
 * It uses the Intersection Observer API.
 * Consuming this hook will not cause any rerenders.
 *
 * @param element
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
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

import { RefObject, useEffect, useRef, useState } from "react";

const useScroll = (scrollContainerRef: RefObject<HTMLElement> | Window) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [scrollHeight, setScrollHeight] = useState(0);

    const scrollPositionRef = useRef(0);
    const isWindowRef = useRef(false);

    const isWindow = (object: any): object is Window => {
        if ("window" in object) {
            isWindowRef.current = true;
            return true;
        }
        return false;
    };

    const handleScroll = () => {
        let position;
        if (isWindowRef.current || isWindow(scrollContainerRef)) {
            scrollContainerRef = scrollContainerRef as Window;
            position = scrollContainerRef.scrollY;
        } else {
            scrollContainerRef = scrollContainerRef as RefObject<HTMLElement>;
            position = scrollContainerRef.current?.scrollTop;
        }

        if (position !== scrollPositionRef.current) {
            setScrollPosition(position ?? 0);
            scrollPositionRef.current = position ?? 0;
        }
    };

    useEffect(() => {
        if (isWindowRef.current || isWindow(scrollContainerRef)) {
            scrollContainerRef = scrollContainerRef as Window;
            scrollContainerRef.addEventListener("scroll", handleScroll, {
                passive: true,
            });

            setScrollHeight(
                document.body.scrollHeight - document.body.offsetHeight
            );
        } else {
            scrollContainerRef = scrollContainerRef as RefObject<HTMLElement>;
            scrollContainerRef.current?.addEventListener(
                "scroll",
                handleScroll,
                {
                    passive: true,
                }
            );

            setScrollHeight(scrollContainerRef.current?.scrollHeight ?? 0);
        }

        return () => {
            if (isWindowRef.current || isWindow(scrollContainerRef)) {
                scrollContainerRef = scrollContainerRef as Window;
                scrollContainerRef.removeEventListener("scroll", handleScroll);
            } else {
                scrollContainerRef =
                    scrollContainerRef as RefObject<HTMLElement>;
                scrollContainerRef.current?.removeEventListener(
                    "scroll",
                    handleScroll
                );
            }
        };
    }, []);

    return { scrollPosition, scrollHeight };
};

export default useScroll;

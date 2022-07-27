import {
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

const useScroll = (divRef: MutableRefObject<HTMLDivElement>) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [scrollHeight, setScrollHeight] = useState(0);

    const scrollPositionRef = useRef(0);

    const handleScroll = useCallback(() => {
        const position = divRef.current?.scrollTop;

        if (position !== scrollPositionRef.current) {
            setScrollPosition(divRef.current?.scrollTop ?? 0);
            scrollPositionRef.current = divRef.current?.scrollTop ?? 0;
        }
    }, [divRef]);

    useEffect(() => {
        const divElement = divRef.current;

        divElement?.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        setScrollHeight(
            (divElement?.scrollHeight ?? 0) - (divElement?.offsetHeight ?? 0)
        );

        return () => divElement?.removeEventListener("scroll", handleScroll);
    }, [divRef, handleScroll]);

    return { scrollPosition, scrollHeight };
};

export default useScroll;

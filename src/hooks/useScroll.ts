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

    const divElement = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef(0);
    const lastScrollHeightRef = useRef(0);

    const handleScroll = useCallback(() => {
        const position = divRef.current?.scrollTop;
        const divHeight =
            (divElement.current?.scrollHeight ?? 0) -
            (divElement.current?.offsetHeight ?? 0);

        if (position !== scrollPositionRef.current) {
            setScrollPosition(divRef.current?.scrollTop ?? 0);
            scrollPositionRef.current = divRef.current?.scrollTop ?? 0;
        }

        if (lastScrollHeightRef.current !== divHeight) {
            setScrollHeight(divHeight);
        }
    }, [divRef]);

    useEffect(() => {
        divElement.current = divRef.current;

        divElement.current?.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        setScrollHeight(
            (divElement.current?.scrollHeight ?? 0) -
                (divElement.current?.offsetHeight ?? 0)
        );

        return () =>
            divElement.current?.removeEventListener("scroll", handleScroll);
    }, [divRef, handleScroll]);

    return { scrollPosition, scrollHeight };
};

export default useScroll;

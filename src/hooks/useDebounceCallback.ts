import { useRef } from "react";

export default function useDebounceCallback() {
    const delayTimeoutIdRef = useRef<NodeJS.Timeout>();

    const debouncedCallback = (callback: () => void, delay: number) => {
        clearTimeout(delayTimeoutIdRef.current);
        delayTimeoutIdRef.current = setTimeout(callback, delay);
    };

    return debouncedCallback;
}

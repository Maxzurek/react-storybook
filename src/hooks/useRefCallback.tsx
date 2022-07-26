import { useCallback, useRef } from "react";

function useRefCallback<Type>() {
    const itemsRef = useRef<Map<string, Type>>();

    const getRefMap = () => {
        if (!itemsRef.current) {
            // Initialize the Map on first usage.
            itemsRef.current = new Map();
        }
        return itemsRef.current;
    };

    const getRef = (key: string) => {
        return getRefMap().get(key);
    };

    const setRefCallback = useCallback((key: string) => {
        return (node: Type) => {
            const refMap = getRefMap();
            if (node) {
                refMap.set(key, node);
            } else {
                refMap.delete(key);
            }
        };
    }, []);

    return { getRefMap, getRef, setRefCallback };
}

export default useRefCallback;

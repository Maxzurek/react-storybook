import { useCallback, useRef } from "react";

function useRefMap<Type>() {
    const itemsRef = useRef<Map<string, Type>>();

    const getRefMap = useCallback(() => {
        if (!itemsRef.current) {
            itemsRef.current = new Map();
        }
        return itemsRef.current;
    }, []);

    const getRef = useCallback(
        (key: string) => {
            return getRefMap().get(key);
        },
        [getRefMap]
    );

    const setRefCallback = useCallback(
        (key: string, node: Type) => {
            const refMap = getRefMap();
            if (node) {
                refMap.set(key, node);
            } else {
                refMap.delete(key);
            }
        },
        [getRefMap]
    );

    return { getRefMap, getRef, setRefCallback };
}

export default useRefMap;

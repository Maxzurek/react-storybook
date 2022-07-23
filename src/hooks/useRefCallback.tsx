import { useRef } from "react";

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

    const setRef = (key: string, node: Type) => {
        getRefMap().set(key, node);
    };

    return { getRefMap, getRef, setRef };
}

export default useRefCallback;

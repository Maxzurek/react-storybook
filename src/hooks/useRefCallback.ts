import { useCallback, useRef } from "react";

function useRefCallback<T>() {
    type CallbackFunction = (node: T) => void;

    const nodesRef = useRef<Map<string, T>>();
    const onNodeAttachedHandlers = useRef<Map<string, CallbackFunction>>(new Map());

    const getNodeMap = useCallback(() => {
        if (!nodesRef.current) {
            nodesRef.current = new Map();
        }
        return nodesRef.current;
    }, []);

    const getNode = useCallback(
        (key: string) => {
            return getNodeMap().get(key);
        },
        [getNodeMap]
    );

    const setRefCallback = useCallback(
        (key: string, node: T) => {
            const refMap = getNodeMap();
            if (node) {
                refMap.set(key, node);

                const onNodeAttachedHandler = onNodeAttachedHandlers.current.get(key);

                if (onNodeAttachedHandler) {
                    onNodeAttachedHandler(node);
                    onNodeAttachedHandlers.current.delete(key);
                }
            } else {
                refMap.delete(key);
            }
        },
        [getNodeMap]
    );

    /**
     * The handler provided will be invoked when the node is attached to it's ref.
     * If it has not been attached yet, it will be invoked when the ref has been attached, but it will be invoked ONLY once.
     */
    const setOnNodeAttachedHandler = useCallback(
        (key: string, onNodeAttachedHandler: (node: T) => void) => {
            const node = getNodeMap().get(key);

            if (!node) {
                onNodeAttachedHandlers.current.set(key, onNodeAttachedHandler);
            } else {
                onNodeAttachedHandler(node);
            }
        },
        [getNodeMap]
    );

    return {
        getNodeMap,
        getNode,
        setRefCallback,
        setOnNodeAttachedHandler,
    };
}

export default useRefCallback;

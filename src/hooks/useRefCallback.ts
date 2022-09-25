import { useCallback, useRef } from "react";

function useRefCallback<T>() {
    type CallbackFunction = (node: T) => void;

    const nodesRef = useRef<Map<string, T>>();
    const nodeAttachedHandlers = useRef<Map<string, CallbackFunction>>(new Map());

    const getNodeMap = useCallback(() => {
        if (!nodesRef.current) {
            nodesRef.current = new Map();
        }
        return nodesRef.current;
    }, []);

    const getNode = useCallback(
        (nodeKey: string) => {
            return getNodeMap().get(nodeKey);
        },
        [getNodeMap]
    );

    const setRefCallback = useCallback(
        (nodeKey: string, node: T) => {
            const refMap = getNodeMap();
            if (node) {
                refMap.set(nodeKey, node);

                const nodeAttachedHandler = nodeAttachedHandlers.current.get(nodeKey);

                if (nodeAttachedHandler) {
                    nodeAttachedHandler(node);
                    nodeAttachedHandlers.current.delete(nodeKey);
                }
            } else {
                refMap.delete(nodeKey);
            }
        },
        [getNodeMap]
    );

    /**
     * The action callback provided will be invoked when the node is attached to it's ref.
     * If it has not been attached yet, it will be invoked when the ref has been attached, but ONLY once.
     */
    const onNodeAttached = useCallback(
        (nodeKey: string, action: (node: T) => void) => {
            const node = getNodeMap().get(nodeKey);

            if (!node) {
                nodeAttachedHandlers.current.set(nodeKey, action);
            } else {
                action(node);
            }
        },
        [getNodeMap]
    );

    return {
        getNodeMap,
        getNode,
        setRefCallback,
        onNodeAttached,
    };
}

export default useRefCallback;

import { useCallback, useRef } from "react";

function useRefCallback<T>() {
    type CallbackFunction = (node: T) => void;

    const nodesRef = useRef<Map<string, T>>();
    const nodeActionCallbacksRef = useRef<Map<string, CallbackFunction>>(new Map());

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

                const onRefAttachedCallback = nodeActionCallbacksRef.current.get(key);

                if (onRefAttachedCallback) {
                    onRefAttachedCallback(node);
                    nodeActionCallbacksRef.current.delete(key);
                }
            } else {
                refMap.delete(key);
            }
        },
        [getNodeMap]
    );

    /**
     * The callback provided will be invoked if the node (that matches with the key provided when setRefCallback was invoked) is attached to it's ref.
     * If it has not been attached yet, it will be invoked once, when the ref has been attached for the first time.
     */
    const setNodeActionCallback = useCallback(
        (key: string, refActionCallback: (node: T) => void) => {
            const node = getNodeMap().get(key);

            if (!node) {
                nodeActionCallbacksRef.current.set(key, refActionCallback);
            } else {
                refActionCallback(node);
            }
        },
        [getNodeMap]
    );

    return { getNodeMap, getNode, setRefCallback, setNodeActionCallback };
}

export default useRefCallback;

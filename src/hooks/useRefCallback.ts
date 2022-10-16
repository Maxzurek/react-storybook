import { useCallback, useEffect, useRef } from "react";

function useRefCallback<T>() {
    type PromiseCallback = {
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: unknown) => void;
    };

    const nodesRef = useRef<Map<string, T>>();
    const onRefAttachedPromiseCallbacksRef = useRef<Map<string, PromiseCallback>>(new Map());

    useEffect(() => {
        const onRefAttachedPromises = onRefAttachedPromiseCallbacksRef.current;

        return () =>
            Array.from(onRefAttachedPromises.values()).forEach((onRefAttachedPromise) =>
                onRefAttachedPromise.reject("useRefCallback hook unmounted")
            );
    }, []);

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

                const onRefAttachedPromiseCallbacks =
                    onRefAttachedPromiseCallbacksRef.current.get(nodeKey);

                if (onRefAttachedPromiseCallbacks) {
                    onRefAttachedPromiseCallbacks.resolve(node);
                    onRefAttachedPromiseCallbacksRef.current.delete(nodeKey);
                }
            } else {
                refMap.delete(nodeKey);
            }
        },
        [getNodeMap]
    );

    /**
     * Returns a promise that will resolve with the node corresponding to the node key when the ref has been attached.
     */
    const onRefAttached = useCallback(
        (nodeKey: string): Promise<T> => {
            return new Promise<T>((resolve, reject) => {
                const node = getNodeMap().get(nodeKey);

                if (!node) {
                    onRefAttachedPromiseCallbacksRef.current.set(nodeKey, {
                        resolve: resolve,
                        reject: reject,
                    });
                } else {
                    resolve(node);
                }
            });
        },
        [getNodeMap]
    );

    return {
        getNodeMap,
        getNode,
        setRefCallback,
        onRefAttached,
    };
}

export default useRefCallback;

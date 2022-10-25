import { useCallback, useEffect, useRef } from "react";

function useRefCallback<T>() {
    type PromiseCallback = {
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: unknown) => void;
    };

    const nodesRef = useRef<Map<string, T>>();
    const promiseCallbacksRef = useRef<Map<string, PromiseCallback>>(new Map());

    useEffect(() => {
        const promiseCallbacks = promiseCallbacksRef.current;

        return () =>
            Array.from(promiseCallbacks.values()).forEach((promiseCallback) =>
                promiseCallback.reject("useRefCallback hook unmounted")
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

                const promiseCallbacks = promiseCallbacksRef.current.get(nodeKey);

                if (promiseCallbacks) {
                    promiseCallbacks.resolve(node);
                    promiseCallbacksRef.current.delete(nodeKey);
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
                    promiseCallbacksRef.current.set(nodeKey, {
                        resolve,
                        reject,
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

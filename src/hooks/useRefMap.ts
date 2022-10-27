import { useCallback, useEffect, useRef } from "react";

function useRefMap<T>() {
    type PromiseCallback = {
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: unknown) => void;
    };

    const ref = useRef<Map<string, T>>();
    const bashedPromiseCallbacksRef = useRef<Map<string, PromiseCallback>>(new Map());

    useEffect(() => {
        const bashedPromiseCallbacks = bashedPromiseCallbacksRef.current;

        return () =>
            Array.from(bashedPromiseCallbacks.values()).forEach((promiseCallback) =>
                promiseCallback.reject("useRefCallback hook unmounted")
            );
    }, []);

    const getRefMap = useCallback(() => {
        if (!ref.current) {
            ref.current = new Map();
        }
        return ref.current;
    }, []);

    const setRefMap = useCallback(
        (key: string, node: T) => {
            const refMap = getRefMap();
            if (node) {
                refMap.set(key, node);

                const bashedPromiseCallback = bashedPromiseCallbacksRef.current.get(key);

                if (bashedPromiseCallback) {
                    bashedPromiseCallback.resolve(node);
                    bashedPromiseCallbacksRef.current.delete(key);
                }
            } else {
                refMap.delete(key);
            }
        },
        [getRefMap]
    );

    const getRef = useCallback(
        (nodeKey: string) => {
            return getRefMap().get(nodeKey);
        },
        [getRefMap]
    );

    /**
     * Returns a promise that will resolve with the node corresponding to the node key when the ref has been attached.
     */
    const onRefAttached = useCallback(
        (key: string): Promise<T> => {
            return new Promise<T>((resolve, reject) => {
                const node = getRefMap().get(key);

                if (!node) {
                    bashedPromiseCallbacksRef.current.set(key, {
                        resolve,
                        reject,
                    });
                } else {
                    resolve(node);
                }
            });
        },
        [getRefMap]
    );

    const setRefMapAndForwardRef = (node: T, forwardedRef: React.ForwardedRef<T>) => {
        if (forwardedRef) {
            if (typeof forwardedRef === "function") {
                forwardedRef(node);
            }
        }
    };

    return {
        getRefMap,
        setRefMap,
        getRef,
        onRefAttached,
        setRefMapAndForwardRef,
    };
}

export default useRefMap;

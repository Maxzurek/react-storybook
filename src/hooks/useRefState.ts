import { useCallback, useState } from "react";

/**
 * This hook provides a way to trigger effects or rerenders after receiving a node from a ref callback.
 *
 * @see https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
 */
export default function useRefState<T>() {
    const [refNode, setRefNode] = useState<T>(null);

    const setRef = useCallback((node: T) => {
        if (node) {
            setRefNode(node);
        }
    }, []);

    return { refNode, setRef };
}

import { useEffect, useRef, useState } from "react";

const useLocalStorageState = <T>(
    key: string,
    defaultValue: T,
    { serialize = JSON.stringify, deserialize = JSON.parse } = {}
) => {
    const [state, setState] = useState<T>(() => {
        const valueInLocalStorage = window.localStorage.getItem(key);

        if (valueInLocalStorage) {
            return deserialize(valueInLocalStorage);
        } else {
            return typeof defaultValue === "function" ? defaultValue() : defaultValue;
        }
    });

    const prevKeyRef = useRef(key);

    useEffect(() => {
        const prevKey = prevKeyRef.current;

        if (prevKey !== key) {
            window.localStorage.removeItem(prevKey);
        }

        prevKeyRef.current = key;
        window.localStorage.setItem(key, serialize(state));
    }, [key, serialize, state]);

    return [state, setState] as [T, React.Dispatch<React.SetStateAction<T>>];
};

export default useLocalStorageState;

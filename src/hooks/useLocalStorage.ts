import * as React from "react";

const useLocalStorageState = <T>(
    key: string,
    defaultValue: T,
    { serialize = JSON.stringify, deserialize = JSON.parse } = {}
) => {
    const [state, setState] = React.useState(() => {
        const valueInLocalStorage = window.localStorage.getItem(key);

        if (valueInLocalStorage) {
            return deserialize(valueInLocalStorage);
        } else {
            return typeof defaultValue === "function" ? defaultValue() : defaultValue;
        }
    });

    const prevKeyRef = React.useRef(key);

    React.useEffect(() => {
        const prevKey = prevKeyRef.current;

        if (prevKey !== key) {
            window.localStorage.removeItem(prevKey);
        }

        prevKeyRef.current = key;
        window.localStorage.setItem(key, serialize(state));
    }, [key, serialize, state]);

    return [state, setState];
};

export default useLocalStorageState;

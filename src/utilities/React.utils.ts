export const handleForwardRef = (
    node: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.ForwardedRef<any>
) => {
    if (ref) {
        if (typeof ref === "function") {
            ref(node);
        } else {
            ref.current = node;
        }
    }
};

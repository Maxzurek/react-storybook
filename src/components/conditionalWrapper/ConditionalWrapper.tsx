import { ReactNode } from "react";

interface ConditionalWrapperProps {
    children: ReactNode;
    isWrapped: boolean;
    wrapper: (children: ReactNode) => ReactNode;
}

export default function ConditionalWrapper({
    children,
    isWrapped,
    wrapper,
}: ConditionalWrapperProps) {
    return isWrapped ? wrapper(children) : children;
}

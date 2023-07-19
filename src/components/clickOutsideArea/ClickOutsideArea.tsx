import "./ClickOutsideArea.scss";

import { ReactNode } from "react";

interface ClickOutsideAreaProps {
    isActive: boolean;
    children: ReactNode;
    onClick: () => void;
}

const ClickOutsideArea = ({ isActive, children, onClick }: ClickOutsideAreaProps) => {
    const handleClick = () => {
        if (!isActive) return;

        onClick();
    };

    return (
        <>
            {isActive && <div className="click-outside-area" onClick={handleClick} />}
            {children}
        </>
    );
};

export default ClickOutsideArea;

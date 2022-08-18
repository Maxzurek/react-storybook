import { RefObject } from "react";
import useScroll from "../../hooks/useScroll";
import "./Header.scss";

interface HeaderProps {
    storiesDivRef: RefObject<HTMLDivElement>;
}

export default function Header({ storiesDivRef }: HeaderProps) {
    const { scrollPosition } = useScroll(storiesDivRef);

    return (
        <div className={`header ${scrollPosition > 50 && "header--squeeze"}`}>
            <img className="header__image" src="/logo192.png" />
            <span>React Storybook</span>
        </div>
    );
}

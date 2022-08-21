import "./Header.scss";

import { RefObject } from "react";
import useScroll from "../../hooks/useScroll";

interface HeaderProps {
    storiesDivRef: RefObject<HTMLDivElement>;
}

export default function Header({ storiesDivRef }: HeaderProps) {
    const { scrollPosition } = useScroll(storiesDivRef);

    const isSqueezed = scrollPosition > 50;

    const imageClassNames = ["header__image"];
    isSqueezed && imageClassNames.push("header__image--squeezed");
    const titleClassNames = ["header__title"];
    isSqueezed && titleClassNames.push("header__title--squeezed");

    return (
        <div className="header">
            <img className={imageClassNames.join(" ")} src="/logo192.png" />
            <span className={titleClassNames.join(" ")}>React Storybook</span>
            <div className="separator separator--horizontal" />
        </div>
    );
}

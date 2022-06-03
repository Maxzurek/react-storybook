import "./Header.scss";

interface HeaderProps {
    scrollPosition: number;
}

export default function Header({ scrollPosition }: HeaderProps) {
    return (
        <div className={`header ${scrollPosition > 50 && "header--squeeze"}`}>
            <img className="header__image" src="/logo192.png" />
            <span>React Storybook</span>
        </div>
    );
}

import "./Header.scss";

interface HeaderProps {
    scrollPosition: number;
}

export default function Header({ scrollPosition }: HeaderProps) {
    return (
        <div className={`header ${scrollPosition > 50 && "header--squeeze"}`}>
            <span>React Storybook</span>
        </div>
    );
}

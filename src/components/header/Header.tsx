import "./Header.scss";

interface HeaderProps{
    scrollPosition: number;
}

export default function Header({scrollPosition}: HeaderProps) {


    return(
        <div className={`header ${scrollPosition > 50 && "header--shrink"}`}>
            <span>Practice Story List</span>
        </div>
    );
}

import "./Chip.scss";

import { withClassNames } from "../../utilities/Html.utils";
import { RxCrossCircled } from "react-icons/rx";

interface ChipProps {
    value: string;
    theme?: "primary" | "secondary" | "accent";
    onDelete: () => void;
}

const Chip = ({ value, theme = "primary", onDelete }: ChipProps) => {
    const handleClick = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <div
            className={withClassNames([
                "chip",
                theme === "secondary" && "chip--theme-secondary",
                theme === "accent" && "chip--theme-accent",
            ])}
        >
            {value}
            <RxCrossCircled className="chip__delete-button" onClick={handleClick} />
        </div>
    );
};

export default Chip;

import { useState } from "react";
import { FormType, useCountFormTypeIcons } from "./CountFormTypeIconProvider";

export default function WrapperContainer() {
    const [svgPath, setSvgPath] = useState("");
    const [getFormTypeIcon] = useCountFormTypeIcons();

    const formType1: FormType = {
        formType: 0,
    };

    return (
        <div>
            <button onClick={() => setSvgPath(getFormTypeIcon(formType1))}>
                Get Icon
            </button>
            {svgPath}
        </div>
    );
}

import { useState } from "react";
import { FormType, useCountFormTypeIcons } from "./CountFormTypeIconProvider";

interface WrapperContainerProps {

}

export default function WrapperContainer(props: WrapperContainerProps) {

    const [svgPath, setSvgPath] = useState("");
    const [getFormTypeIcon] = useCountFormTypeIcons();

    const formType1: FormType = {
        formType: 0
    }

    return (
        <div>
            <button onClick={() => setSvgPath(getFormTypeIcon(formType1))}>Get Icon</button>
            {svgPath}
        </div>
    )
};

import { useState } from "react";
import { FormType, useCountFormIcons } from "./CountFormTypeIconProvider";

interface WrapperContainerProps {

}

export default function WrapperContainer(props: WrapperContainerProps) {

    const [svgPath, setSvgPath] = useState("");
    const [getFormTypeIcon] = useCountFormIcons();

    const formType1: FormType = {
        formType: 0
    }

    return (
        <div>
            WrapperContainer
            <div>
                <button onClick={() => setSvgPath(getFormTypeIcon(formType1))}>Get Icon</button>
            </div>
            <div>
                {svgPath}
            </div>
        </div>
    )
};

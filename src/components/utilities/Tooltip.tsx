import { ReactNode } from "react"

interface TooltipProps{
    children: ReactNode
}

export default function Tooltip(props: TooltipProps) {



    return(
        <div className="tooltip">
            {props.children}
        </div>
    );
};

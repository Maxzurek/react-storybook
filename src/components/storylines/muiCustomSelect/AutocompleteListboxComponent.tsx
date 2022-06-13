import "./AutocompleteListboxComponent.scss";

import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";

interface AutocompleteListboxComponentProps {
    props: React.HTMLAttributes<HTMLElement>;
}

export default function AutocompleteListboxComponent({
    props,
}: AutocompleteListboxComponentProps) {
    return (
        <PerfectScrollbar>
            <div
                className="autocomplete-listbox-component__container"
                style={{ height: " 200px" }}
            >
                <ul
                    {...props}
                    style={{
                        overflow: "visible",
                    }}
                />
            </div>
        </PerfectScrollbar>
    );
}

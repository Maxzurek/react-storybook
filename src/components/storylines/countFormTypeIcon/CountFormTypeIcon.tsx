import "./CountFormTypeIcon.scss";

import { CountFormTypeIconsProvider } from "./CountFormTypeIconProvider";
import WrapperContainer from "./WrapperContainer";

export default function CountFormTypeIcon() {
    return (
        <div className="count-form-type-icon">
            <CountFormTypeIconsProvider>
                <WrapperContainer />
            </CountFormTypeIconsProvider>
        </div>
    );
}

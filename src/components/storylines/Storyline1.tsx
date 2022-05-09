import "./Storyline1.scss";

import { CountFormTypeIconsProvider } from "../CountFormTypeIconProvider/CountFormTypeIconProvider";
import WrapperContainer from "../CountFormTypeIconProvider/WrapperContainer";

export default function Storyline1() {
    return (
        <div className="storyline1-root">
            <CountFormTypeIconsProvider>
                <WrapperContainer />
            </CountFormTypeIconsProvider>
        </div>
    );
}

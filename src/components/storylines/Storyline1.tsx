import "./Storyline1.scss";

import { CountFormTypeIconsProvider } from "../countFormTypeIconProvider/CountFormTypeIconProvider";
import WrapperContainer from "../countFormTypeIconProvider/WrapperContainer";

export default function Storyline1() {
    return (
        <div className="storyline1-root">
            <CountFormTypeIconsProvider>
                <WrapperContainer />
            </CountFormTypeIconsProvider>
        </div>
    );
}

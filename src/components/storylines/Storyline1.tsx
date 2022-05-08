import "./Storyline1.scss"

import { CountFormTypeIconsProvider } from "../CountFormTypeIconProvider/CountFormTypeIconProvider";
import WrapperContainer from "../CountFormTypeIconProvider/WrapperContainer";

interface Storyline1Props {
}

export default function Storyline1(props: Storyline1Props) {

    return (
        <div className="storyline1-root">
            <CountFormTypeIconsProvider>
                <WrapperContainer />
            </CountFormTypeIconsProvider>
        </div>
    )
};

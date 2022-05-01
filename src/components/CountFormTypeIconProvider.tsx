import { faDiceSix } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createContext, ReactNode, useContext, useState } from "react";

// For Test purposes
export interface FormType {
    formType: number;
}

interface IconData {
    formType: FormType,
    svgPathDefinition: string,
}

interface CountFormTypeIconsProviderProps {
    children: ReactNode
}

interface ICountFormTypeIconsContext {
    countFormTypeIconData: IconData[]
    getCountFormTypeIconData(formType: FormType): string
}

const CountFormTypeIconsContext = createContext<ICountFormTypeIconsContext | undefined>(undefined);
CountFormTypeIconsContext.displayName = "CountFormTypeIconsContext";

const CountFormTypeIconsProvider = (props: CountFormTypeIconsProviderProps) => {
    const [countFormTypeIconData, setCountFormTypeIconData] = useState<IconData[]>([]);
    const [showSvg, setShowSvg] = useState(false);
    const { children } = props;

    const getIconData = (formType: FormType, iconName: string) => {
        let elementBaseId = "fontawsome-icon-";
        let existingUconData = countFormTypeIconData.find(data => data.formType.formType === formType.formType);

        if (existingUconData) {
            return existingUconData.svgPathDefinition;
        }

        let iconData: IconData = {
            formType,
            svgPathDefinition: ""
        }
        let pathElement = document.getElementById(`${elementBaseId}${iconName}`)?.children[0];

        if (pathElement) {
            let svgPathDefinition = pathElement.getAttribute("d");

            if (svgPathDefinition) {
                iconData.svgPathDefinition = svgPathDefinition
                iconData.formType = formType;
                setCountFormTypeIconData((prevIconData: IconData[]) => [...prevIconData, iconData]);
            }
        }

        return iconData.svgPathDefinition;
    }

    const getFormTypeIcon = (formType: FormType) => {
        switch (formType.formType) {
            case 0:
                return getIconData(formType, "icon0");
            default:
                return "";
        }
    }

    return (
        <CountFormTypeIconsContext.Provider value={{
            countFormTypeIconData,
            getCountFormTypeIconData: getFormTypeIcon,
        }}>
            {children}
            <button onClick={() => setShowSvg(!showSvg)}>Show SVG</button>
            <div style={{ display: showSvg ? '' : 'none' }}>
                <FontAwesomeIcon icon={faDiceSix} fontSize={"90"} id="fontawsome-icon-icon0" />
            </div>
        </CountFormTypeIconsContext.Provider>
    )
}

const useCountFormTypeIcons = () => {
    const context = useContext(CountFormTypeIconsContext);

    if (!context) {
        throw Error("Component must be rendered inside CountFormTypeIconsProvider");
    }

    const { getCountFormTypeIconData } = context;

    return [getCountFormTypeIconData];
};

export {
    CountFormTypeIconsProvider,
    useCountFormTypeIcons,
};

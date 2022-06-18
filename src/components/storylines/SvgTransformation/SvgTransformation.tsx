import { useEffect, useState } from "react";
import "./SvgTransformation.scss";
import SVGPathCommander from "svg-path-commander";

interface SvgData {
    viewBox: string;
    pathData: string;
}

export default function SvgTransformation() {
    const [selectedFile, setSelectedFile] = useState<File>();
    const [svgData, setSvgData] = useState<SvgData>();
    const [svgOuterHTML, setSvgOuterHTML] = useState<string>();

    const svgSize = 512;
    const svgElementId = "svg-element";

    useEffect(() => {
        const svgElement = window.document.getElementById("svg-element");
        let svgOuterHTML = svgElement?.outerHTML;

        svgOuterHTML = svgOuterHTML?.replace(`height="${svgSize}" `, "");
        svgOuterHTML = svgOuterHTML?.replace(` width="${svgSize}"`, "");
        svgOuterHTML = svgOuterHTML?.replace(` id="${svgElementId}"`, "");
        setSvgOuterHTML(svgOuterHTML);
    }, [svgData]);

    const getElementAttribute = (element: Element) => {
        const svgData: SvgData = {
            viewBox: "",
            pathData: "",
        };

        switch (element.tagName) {
            case "svg":
                {
                    const viewBox = element.getAttribute("viewBox");

                    if (viewBox) {
                        svgData.viewBox = viewBox;
                    }
                }
                break;
            case "path":
                {
                    const pathData = element.getAttribute("d");
                    const absPath = new SVGPathCommander(pathData)
                        .toAbsolute()
                        .toString();
                    svgData.pathData += absPath;
                }
                break;
            default:
                break;
        }

        return svgData;
    };

    const concatElementDataToSvgData = (element: Element, svgData: SvgData) => {
        const elementData = getElementAttribute(element);
        svgData.viewBox = elementData.viewBox
            ? elementData.viewBox
            : svgData.viewBox;
        svgData.pathData += elementData.pathData;

        return svgData;
    };

    const parseSvgElementData = (element: Element, svgData: SvgData) => {
        let concatenatedSvgData: SvgData = concatElementDataToSvgData(
            element,
            svgData
        );

        for (let index = 0; index < element.children.length; index++) {
            const child = element.children[index];

            concatenatedSvgData = concatElementDataToSvgData(
                child,
                concatenatedSvgData
            );

            const childChildren = child.children;

            if (childChildren.length > 0) {
                concatenatedSvgData = parseSvgElementData(
                    child,
                    concatenatedSvgData
                );
            }
        }

        return concatenatedSvgData;
    };

    const parseSvgElement = (svgElement: Element) => {
        let svgData: SvgData = {
            viewBox: "",
            pathData: "",
        };

        svgData = parseSvgElementData(svgElement, svgData);

        const pathBbox = SVGPathCommander.getPathBBox(svgData.pathData);
        console.log(pathBbox);
        const transform = {
            translate: [pathBbox.x * -1, pathBbox.y * -1], // 2D translation
            rotate: [0, 0], // 2D rotation
            scale: 1, // uniform scale on X, Y, Z axis
            skew: [0, 0], // 2D skew
            origin: [0, 0], // if not specified, it will calculate a bounding box to determine a proper `transform-origin`
        };
        const transformedPathData = SVGPathCommander.transformPath(
            svgData.pathData,
            transform
        );
        const optimizedPathData = new SVGPathCommander(transformedPathData)
            .optimize()
            .toString();
        const optimizedPathBbox =
            SVGPathCommander.getPathBBox(optimizedPathData);
        console.log(optimizedPathBbox);

        svgData.viewBox = `0 0 ${optimizedPathBbox.x2} ${optimizedPathBbox.y2}`;
        svgData.pathData = optimizedPathData;
        console.log(svgData);
        setSvgData(svgData);

        return svgData;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            const svgData = e.target?.result;

            if (svgData && typeof svgData === "string") {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgData, "image/svg+xml");

                parseSvgElement(doc.children?.[0]);
            }
        };
        reader.readAsText(file as Blob);
    };

    const handleFileUpload = () => {
        const formData = new FormData();
        formData.append("myFile", selectedFile as Blob, selectedFile?.name);
        console.log("Uploading - Could do a POST request with form data");
    };

    const handleCopyToClipboard = async (svgOuterHTML: string) => {
        await navigator.clipboard.writeText(svgOuterHTML);
    };

    return (
        <div className="svg-transformation">
            <div>
                <input type="file" onChange={handleFileChange} />
                {/* <button onClick={handleFileUpload}>Upload!</button> */}
                {svgOuterHTML && (
                    <button onClick={() => handleCopyToClipboard(svgOuterHTML)}>
                        Copy to clipboard
                    </button>
                )}
            </div>
            <div className="svg-transformation__container">
                <div className="svg-transformation__svg-container">
                    {svgData && (
                        <svg
                            height={svgSize}
                            id={svgElementId}
                            viewBox={svgData.viewBox}
                            width={svgSize}
                        >
                            <path d={svgData.pathData} />
                        </svg>
                    )}
                </div>
                <div>
                    <textarea id="textarea-svgOuterHTML" value={svgOuterHTML} />
                </div>
            </div>
        </div>
    );
}

import "./SvgTransformation.scss";

import { useEffect, useRef, useState } from "react";
import SVGPathCommander from "svg-path-commander";
import potrace from "potrace";
import { CircularProgress } from "@mui/material";

interface SvgData {
    viewBox: string;
    pathData: string;
}

export default function SvgTransformation() {
    const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);
    const [svgData, setSvgData] = useState<SvgData>();
    const [svgOuterHTML, setSvgOuterHTML] = useState<string>();
    const [isParsing, setIsPasing] = useState(false);

    const copyToClipboardButtonRef = useRef<HTMLButtonElement>(null);
    const copyToClipboardButtonOffsetTop =
        copyToClipboardButtonRef?.current?.offsetTop;
    const copyToClipboardButtonOffsetHeight =
        copyToClipboardButtonRef?.current?.offsetHeight;
    const copyToClipboardButtonBottomPosition =
        copyToClipboardButtonOffsetTop && copyToClipboardButtonOffsetHeight
            ? copyToClipboardButtonOffsetTop + copyToClipboardButtonOffsetHeight
            : undefined;

    const svgSize = 512;
    const svgElementId = "svg-element";

    useEffect(() => {
        const svgElement = window.document.getElementById("svg-element");
        let svgOuterHTML = svgElement?.outerHTML;

        svgOuterHTML = svgOuterHTML?.replace(`height="${svgSize}" `, "");
        svgOuterHTML = svgOuterHTML?.replace(` width="${svgSize}"`, "");
        svgOuterHTML = svgOuterHTML?.replace(` id="${svgElementId}"`, "");
        svgOuterHTML = svgOuterHTML?.replace("</path>", "");
        // eslint-disable-next-line quotes
        svgOuterHTML = svgOuterHTML?.replace(">", " {...props}>");
        // eslint-disable-next-line quotes
        svgOuterHTML = svgOuterHTML?.replace('">', '"/>');
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

    const parseSvgString = async (svgString: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = doc.children?.[0];

        let svgData: SvgData = {
            viewBox: "",
            pathData: "",
        };

        svgData = parseSvgElementData(svgElement, svgData);

        const pathBbox = SVGPathCommander.getPathBBox(svgData.pathData);
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

        svgData.viewBox = `0 0 ${optimizedPathBbox.x2} ${optimizedPathBbox.y2}`;
        svgData.pathData = optimizedPathData;
        setSvgData(svgData);

        return svgData;
    };

    const posterizeAndParseFile = async (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            potrace.posterize(
                reader.result as string,
                { threshold: 100 },
                async (err, svg) => {
                    parseSvgString(svg).then(() => setIsPasing(false));
                }
            );
        };
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setIsPasing(true);
        setSvgOuterHTML("");
        setIsCopiedToClipboard(false);

        const file = event.target.files?.[0];

        switch (file?.type) {
            case "image/svg+xml":
                {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        parseSvgString(e.target?.result as string).then(() =>
                            setIsPasing(false)
                        );
                    };
                    reader.readAsText(file as Blob);
                }
                break;
            case "image/png":
                {
                    posterizeAndParseFile(file);
                }
                break;
            default:
                setIsPasing(false);
                return;
        }
    };

    // const handleFileUpload = () => {
    //     const formData = new FormData();
    //     formData.append("myFile", selectedFile as Blob, selectedFile?.name);
    //     console.log("Uploading - Could do a POST request with formData");
    // };

    const handleCopyToClipboard = async (svgOuterHTML: string) => {
        await navigator.clipboard.writeText(svgOuterHTML).then(() => {
            setIsCopiedToClipboard(true);

            const timeout = 3000;
            setTimeout(() => {
                setIsCopiedToClipboard(false);
            }, timeout);
        });
        // test
    };

    return (
        <div className="svg-transformation">
            <div>
                <input
                    id="filePicker"
                    type="file"
                    onChange={handleFileChange}
                />
                {/* <button onClick={handleFileUpload}>Upload!</button> */}
                {isParsing && <CircularProgress disableShrink thickness={4} />}
                {svgOuterHTML && (
                    <button
                        ref={copyToClipboardButtonRef}
                        className="svg-transformation__copytoclipboard-button"
                        onClick={() => handleCopyToClipboard(svgOuterHTML)}
                    >
                        Copy to clipboard
                    </button>
                )}
                {isCopiedToClipboard && (
                    <div
                        className={`svg-transformation__copied-tooltip ${
                            isCopiedToClipboard
                                ? "svg-transformation__copied-tooltip--visible"
                                : ""
                        }`}
                        style={{
                            top: copyToClipboardButtonRef.current?.offsetTop,
                            left: copyToClipboardButtonRef.current?.offsetLeft,
                        }}
                    >
                        <span>Copied to clipboard!</span>
                    </div>
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
                    <textarea spellCheck={false} value={svgOuterHTML} />
                </div>
            </div>
        </div>
    );
}

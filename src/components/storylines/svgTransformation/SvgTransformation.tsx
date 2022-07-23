import "./SvgTransformation.scss";

import { useEffect, useRef, useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";
import {
    convertPngOrJpgFileToSvg,
    flipSvgPath,
    parseSvgFile,
    rotateSvgPath,
    SvgData,
    TransformDirection,
    translateSvg,
} from "./SvgTransformation.utils";
import { TransformButtonsPad } from "./TransformButtonsPad";

export default function SvgTransformation() {
    const [selectedFileName, setSelectedFileName] = useState<string>();
    const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);
    const [svgData, setSvgData] = useState<SvgData>();
    const [svgOuterHTML, setSvgOuterHTML] = useState<string>();
    const [isParsing, setIsParsing] = useState(false);
    const [elementName, setElementName] = useState<string>();

    const copyToClipboardButtonRef = useRef<HTMLButtonElement>(null);
    const inputEl = useRef<HTMLInputElement>(null);

    const svgSize = 512;
    const svgElementId = "svg-element";

    // useEffect(() => {
    //     worker.onmessage = (e) => {
    //         console.log(e.data);
    //     };
    // }, []);

    useEffect(() => {
        const svgElement = window.document.getElementById(svgElementId);
        let svgOuterHTML = "";
        let elementTopPart = "";
        let elementBottomPart = "";

        if (elementName) {
            elementTopPart = `import React, { SVGAttributes } from "react";
             
                export default function ${elementName}(props: SVGAttributes<SVGSVGElement>) {
                    return (`;
            elementBottomPart = ");}";
        }

        if (svgElement) {
            svgOuterHTML += elementTopPart;
            svgOuterHTML += svgElement.outerHTML;
            svgOuterHTML = svgOuterHTML?.replace(`height="${svgSize}" `, "");
            svgOuterHTML = svgOuterHTML?.replace(` width="${svgSize}"`, "");
            svgOuterHTML = svgOuterHTML?.replace(` id="${svgElementId}"`, "");
            svgOuterHTML = svgOuterHTML?.replace("</path>", "");
            if (elementName) {
                // eslint-disable-next-line quotes
                svgOuterHTML = svgOuterHTML?.replace('">', '" {...props}>');
            } else {
                // eslint-disable-next-line quotes
                svgOuterHTML = svgOuterHTML?.replace(">", " >");
            }
            // eslint-disable-next-line quotes
            svgOuterHTML = svgOuterHTML?.replace('">', '"/>');
            svgOuterHTML += elementBottomPart;
            setSvgOuterHTML(svgOuterHTML);
        }
    }, [svgData, elementName]);

    const handleParsingDone = (svgData: SvgData) => {
        document.body.style.cursor = "default";
        setIsParsing(false);
        setSvgData(svgData);
    };

    const handleCopyToClipboard = async (svgOuterHTML: string) => {
        await navigator.clipboard.writeText(svgOuterHTML).then(() => {
            setIsCopiedToClipboard(true);

            const timeout = 3000;
            setTimeout(() => {
                setIsCopiedToClipboard(false);
            }, timeout);
        });
    };

    const handleRotateSvg = (rotateDirection: TransformDirection) => {
        if (svgData) {
            setIsParsing(true);
            document.body.style.cursor = "wait";

            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };
            let rotation = 0;

            switch (rotateDirection) {
                case TransformDirection.RotateLeft:
                    rotation = -90;
                    break;
                case TransformDirection.RotateRight:
                    rotation = 90;
                    break;
                default:
                    break;
            }

            setTimeout(async () => {
                newSvgData = rotateSvgPath(svgData, rotation);
                setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
                setIsParsing(false);
                document.body.style.cursor = "default";
            });
        }
    };

    const handleTranslateSvg = (moveDirection: TransformDirection) => {
        if (svgData) {
            document.body.style.cursor = "wait";
            setIsParsing(true);

            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };

            setTimeout(async () => {
                newSvgData = translateSvg(svgData, moveDirection);
                setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
                setIsParsing(false);
                document.body.style.cursor = "default";
            });
        }
    };

    const handleFlipSvg = () => {
        if (svgData) {
            document.body.style.cursor = "wait";
            setIsParsing(true);

            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };

            setTimeout(async () => {
                newSvgData = flipSvgPath(svgData, 180);
                setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
                setIsParsing(false);
                document.body.style.cursor = "default";
            });
        }
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        document.body.style.cursor = "wait";

        setIsParsing(true);
        setSelectedFileName(file?.name);
        setSvgOuterHTML("");
        setElementName("");
        setIsCopiedToClipboard(false);

        switch (file?.type) {
            case "image/svg+xml":
                {
                    setTimeout(async () => {
                        const svgData = await parseSvgFile(file);
                        handleParsingDone(svgData);
                    }, 500);
                }
                break;
            case "image/png":
            case "image/jpeg":
                {
                    setTimeout(async () => {
                        const svgData = await convertPngOrJpgFileToSvg(file);
                        handleParsingDone(svgData);
                    }, 500);
                }
                break;
            default:
                setIsParsing(false);
                return;
        }
    };

    return (
        <div className="svg-transformation">
            <div className="svg-transformation__header">
                <Button
                    component="label"
                    disabled={isParsing}
                    variant="contained"
                >
                    {isParsing ? "Loading..." : "Choose File (SVG/PNG/JPG)"}
                    <input
                        ref={inputEl}
                        accept="image/*"
                        hidden
                        type="file"
                        onChange={handleFileChange}
                    />
                </Button>
                {selectedFileName ? (
                    <>
                        <span> Selected file:</span>
                        <label>{selectedFileName}</label>
                    </>
                ) : (
                    <label>No file chosen</label>
                )}
                {svgOuterHTML && (
                    <>
                        <TransformButtonsPad
                            onFlipSvg={handleFlipSvg}
                            onRotateSvg={handleRotateSvg}
                            onTranslateSvg={handleTranslateSvg}
                        ></TransformButtonsPad>
                        <TextField
                            color="success"
                            label="Element name"
                            value={elementName}
                            onChange={(e) => setElementName(e.target.value)}
                        />
                        <Button
                            ref={copyToClipboardButtonRef}
                            className="svg-transformation__copyToClipboard-button"
                            onClick={() => handleCopyToClipboard(svgOuterHTML)}
                        >
                            Copy to clipboard
                        </Button>
                    </>
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
                            width: copyToClipboardButtonRef.current
                                ?.clientWidth,
                        }}
                    >
                        <span>Copied to clipboard!</span>
                    </div>
                )}
            </div>
            <div className="svg-transformation__container">
                <div className="svg-transformation__svg-container">
                    {svgData && !isParsing && (
                        <svg
                            height={svgSize}
                            id={svgElementId}
                            viewBox={svgData.viewBox}
                            width={svgSize}
                        >
                            <path d={svgData.pathData} />
                        </svg>
                    )}
                    {isParsing && (
                        <div
                            className={
                                "svg-transformation__svg-circular-progress"
                            }
                        >
                            <CircularProgress disableShrink thickness={4} />
                        </div>
                    )}
                </div>
                <div>
                    <textarea spellCheck={false} value={svgOuterHTML} />
                </div>
            </div>
        </div>
    );
}

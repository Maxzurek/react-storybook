import "./SvgTransformation.scss";

import { useDebugValue, useEffect, useRef, useState } from "react";
import {
    Button,
    CircularProgress,
    IconButton,
    TextField,
    Tooltip,
} from "@mui/material";
import {
    convertPngOrJpgFileToSvg,
    flipSvgPath,
    parseSvgFile,
    rotateSvgPath,
    SvgData,
    TransformDirection,
    translateSvg,
} from "./SvgTransformation.utils";
import {
    ArrowBack,
    ArrowDownward,
    ArrowForward,
    ArrowUpward,
    RotateLeft,
    RotateRight,
    ThreeSixty,
} from "@mui/icons-material";
import { flushSync } from "react-dom";

// const worker = new Worker(
//     new URL("../../../parseSvgFile.worker.js", import.meta.url),
//     {
//         type: "module",
//     }
// );

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
            }, 1);
        }
    };

    const handleTranslateSvg = (moveDirection: TransformDirection) => {
        if (svgData) {
            setIsParsing(true);
            document.body.style.cursor = "wait";

            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };

            setTimeout(async () => {
                newSvgData = translateSvg(svgData, moveDirection);
                setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
                setIsParsing(false);
                document.body.style.cursor = "default";
            }, 1);
        }
    };

    const handleFlipSvg = () => {
        if (svgData) {
            setIsParsing(true);
            document.body.style.cursor = "wait";

            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };

            setTimeout(async () => {
                newSvgData = flipSvgPath(svgData, 180);
                setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
                setIsParsing(false);
                document.body.style.cursor = "default";
            }, 1);
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
                    {isParsing ? "Loading..." : "Choose File"}
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
                        <div className="svg-transformation__action-buttons">
                            <div className="svg-transformation__action-buttons-top-row">
                                <div>Transform</div>
                                <Tooltip
                                    arrow
                                    placement="left"
                                    title="Rotate 90 degrees left"
                                >
                                    <IconButton
                                        onClick={() =>
                                            handleRotateSvg(
                                                TransformDirection.RotateLeft
                                            )
                                        }
                                    >
                                        <RotateLeft />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip arrow placement="top" title="Move up">
                                    <IconButton
                                        onClick={() =>
                                            handleTranslateSvg(
                                                TransformDirection.MoveUp
                                            )
                                        }
                                    >
                                        <ArrowUpward />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip
                                    arrow
                                    placement="right"
                                    title="Rotate 90 degrees right"
                                >
                                    <IconButton
                                        onClick={() =>
                                            handleRotateSvg(
                                                TransformDirection.RotateRight
                                            )
                                        }
                                    >
                                        <RotateRight />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <div className="svg-transformation__action-buttons-row">
                                <Tooltip
                                    arrow
                                    placement="left"
                                    title="Move left"
                                >
                                    <IconButton
                                        onClick={() =>
                                            handleTranslateSvg(
                                                TransformDirection.MoveLeft
                                            )
                                        }
                                    >
                                        <ArrowBack />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip
                                    arrow
                                    placement="bottom"
                                    title="Move down"
                                >
                                    <IconButton
                                        onClick={() =>
                                            handleTranslateSvg(
                                                TransformDirection.MoveDown
                                            )
                                        }
                                    >
                                        <ArrowDownward />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip
                                    arrow
                                    placement="right"
                                    title="Move right"
                                >
                                    <IconButton
                                        onClick={() =>
                                            handleTranslateSvg(
                                                TransformDirection.MoveRight
                                            )
                                        }
                                    >
                                        <ArrowForward />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <div className="svg-transformation__action-buttons-row">
                                <Tooltip
                                    arrow
                                    placement="bottom"
                                    title="Flip 180 degrees"
                                >
                                    <IconButton onClick={handleFlipSvg}>
                                        <ThreeSixty />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                        <TextField
                            color="success"
                            label="Element name"
                            value={elementName}
                            onChange={(e) => setElementName(e.target.value)}
                        />
                        <Button
                            ref={copyToClipboardButtonRef}
                            className="svg-transformation__copytoclipboard-button"
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

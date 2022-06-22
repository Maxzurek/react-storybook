import "./SvgTransformation.scss";

import { useEffect, useRef, useState } from "react";
import {
    Button,
    CircularProgress,
    IconButton,
    TextField,
    Tooltip,
} from "@mui/material";
import {
    convertPngOrJpgFileToSvg,
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
} from "@mui/icons-material";

export default function SvgTransformation() {
    const [selectedFileName, setSelectedFileName] = useState<string>();
    const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);
    const [svgData, setSvgData] = useState<SvgData>();
    const [svgOuterHTML, setSvgOuterHTML] = useState<string>();
    const [isParsing, setIsPasing] = useState(false);
    const [elementName, setElementName] = useState<string>();

    const copyToClipboardButtonRef = useRef<HTMLButtonElement>(null);
    const inputEl = useRef<HTMLInputElement>(null);

    const svgSize = 512;
    const svgElementId = "svg-element";

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

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFileName(file?.name);
        setIsPasing(true);
        setSvgOuterHTML("");
        setElementName("");
        setIsCopiedToClipboard(false);

        switch (file?.type) {
            case "image/svg+xml":
                {
                    const svgString = await parseSvgFile(file);
                    setIsPasing(false);
                    setSvgData(svgString);
                }
                break;
            case "image/png":
            case "image/jpeg":
                {
                    const svgString = await convertPngOrJpgFileToSvg(file);
                    setIsPasing(false);
                    setSvgData(svgString);
                }
                break;
            default:
                setIsPasing(false);
                return;
        }
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
            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };

            switch (rotateDirection) {
                case TransformDirection.RotateLeft:
                    newSvgData = rotateSvgPath(svgData, -90);
                    break;
                case TransformDirection.RotateRight:
                    newSvgData = rotateSvgPath(svgData, 90);
                    break;
                default:
                    break;
            }
            setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
        }
    };

    const handleTranslateSvg = (moveDirection: TransformDirection) => {
        if (svgData) {
            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };
            switch (moveDirection) {
                case TransformDirection.MoveLeft:
                    newSvgData = translateSvg(svgData, moveDirection);
                    break;
                case TransformDirection.MoveRight:
                    newSvgData = translateSvg(svgData, moveDirection);
                    break;
                case TransformDirection.MoveUp:
                    newSvgData = translateSvg(svgData, moveDirection);
                    break;
                case TransformDirection.MoveDown:
                    newSvgData = translateSvg(svgData, moveDirection);
                    break;
                default:
                    break;
            }
            setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
        }
    };

    return (
        <div className="svg-transformation">
            <div className="svg-transformation__header">
                <Button
                    component="label"
                    variant="contained"
                    // onClick={() => inputEl.current?.click()}
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
                {/* <button onClick={handleFileUpload}>Upload!</button> */}
                {isParsing && <CircularProgress disableShrink thickness={4} />}
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
                            <div className="svg-transformation__action-buttons-bottom-row">
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
                </div>
                <div>
                    <textarea spellCheck={false} value={svgOuterHTML} />
                </div>
            </div>
        </div>
    );
}

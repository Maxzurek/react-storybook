import "./SvgTransformation.scss";

import SVGPathCommander from "svg-path-commander";
import { useEffect, useRef, useState } from "react";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import {
    parseSvgString,
    rotateSvgPath,
    SvgData,
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
import potrace from "potrace";

export enum Transform {
    RotateLeft,
    RotateRight,
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
}

export default function SvgTransformation() {
    const [selectedFileName, setSelectedFileName] = useState<string>();
    const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);
    const [svgData, setSvgData] = useState<SvgData>();
    const [svgOuterHTML, setSvgOuterHTML] = useState<string>();
    const [isParsing, setIsPasing] = useState(false);

    const copyToClipboardButtonRef = useRef<HTMLButtonElement>(null);
    const inputEl = useRef<HTMLInputElement>(null);

    const svgSize = 512;
    const svgElementId = "svg-element";

    useEffect(() => {
        const svgElement = window.document.getElementById(svgElementId);
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

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        setSelectedFileName(file?.name);
        setIsPasing(true);
        setSvgOuterHTML("");
        setIsCopiedToClipboard(false);

        switch (file?.type) {
            case "image/svg+xml":
                {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const svgData = parseSvgString(
                            e.target?.result as string
                        );
                        setIsPasing(false);
                        setSvgData(svgData);
                    };
                    reader.readAsText(file as Blob);
                }
                break;
            case "image/png":
                {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const posterizer = new potrace.Posterizer({
                            steps: 3,
                            threshold: 100,
                        });
                        posterizer.loadImage(reader.result as string, (err) => {
                            if (err) throw err;

                            const svgString = posterizer.getSVG();
                            const svgData = parseSvgString(svgString);
                            const reversedPath = SVGPathCommander.normalizePath(
                                svgData.pathData
                            );
                            const optimizedPathString = new SVGPathCommander(
                                reversedPath,
                                { round: "auto" }
                            )
                                .optimize()
                                .toString();
                            svgData.pathData = optimizedPathString;
                            setIsPasing(false);
                            setSvgData(svgData);
                        });
                    };
                    reader.readAsDataURL(file);
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
    };

    const handleRotateSvg = (rotateDirection: Transform) => {
        if (svgData) {
            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };

            switch (rotateDirection) {
                case Transform.RotateLeft:
                    newSvgData = rotateSvgPath(svgData, -90);
                    break;
                case Transform.RotateRight:
                    newSvgData = rotateSvgPath(svgData, 90);
                    break;
                default:
                    break;
            }
            setSvgData({ ...newSvgData, pathData: newSvgData.pathData });
        }
    };

    const handleTranslateSvg = (moveDirection: Transform) => {
        if (svgData) {
            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };
            switch (moveDirection) {
                case Transform.MoveLeft:
                    newSvgData = translateSvg(svgData, moveDirection, -1);
                    break;
                case Transform.MoveRight:
                    newSvgData = translateSvg(svgData, moveDirection, 1);
                    break;
                case Transform.MoveUp:
                    newSvgData = translateSvg(svgData, moveDirection, -1);
                    break;
                case Transform.MoveDown:
                    newSvgData = translateSvg(svgData, moveDirection, 1);
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
                        accept="image/svg+xml"
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
                                                Transform.RotateLeft
                                            )
                                        }
                                    >
                                        <RotateLeft />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip arrow placement="top" title="Move up">
                                    <IconButton
                                        onClick={() =>
                                            handleTranslateSvg(Transform.MoveUp)
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
                                                Transform.RotateRight
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
                                                Transform.MoveLeft
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
                                                Transform.MoveDown
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
                                                Transform.MoveRight
                                            )
                                        }
                                    >
                                        <ArrowForward />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
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

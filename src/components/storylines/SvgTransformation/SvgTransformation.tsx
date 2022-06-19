import "./SvgTransformation.scss";

import { useEffect, useRef, useState } from "react";
import {
    Button,
    CircularProgress,
    IconButton,
    Input,
    Tooltip,
} from "@mui/material";
import {
    parseSvgString,
    posterizeAndParseFile,
    rotateSvgPath,
    SvgData,
} from "./SvgTransformation.utils";
import { RotateLeft, RotateRight } from "@mui/icons-material";

enum RotationDirection {
    Left,
    Right,
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
                    reader.onload = async (e) => {
                        await parseSvgString(e.target?.result as string).then(
                            (svgData: SvgData) => {
                                setIsPasing(false);
                                setSvgData(svgData);
                            }
                        );
                    };
                    reader.readAsText(file as Blob);
                }
                break;
            case "image/png":
                {
                    posterizeAndParseFile(file).then((svgData: SvgData) => {
                        setIsPasing(false);
                        setSvgData(svgData);
                    });
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

    const handleRotateSvg = (rotateDirection: RotationDirection) => {
        if (svgData) {
            let newSvgData: SvgData = {
                viewBox: "",
                pathData: "",
            };

            switch (rotateDirection) {
                case RotationDirection.Left:
                    newSvgData = rotateSvgPath(svgData, -90);
                    break;
                case RotationDirection.Right:
                    newSvgData = rotateSvgPath(svgData, 90);
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
                    <label>{selectedFileName}</label>
                ) : (
                    "No file chosen"
                )}
                {/* <button onClick={handleFileUpload}>Upload!</button> */}
                {isParsing && <CircularProgress disableShrink thickness={4} />}
                {svgOuterHTML && (
                    <div className="svg-transformation__action-buttons">
                        <Tooltip arrow title="Rotate 90 degrees left">
                            <IconButton
                                onClick={() =>
                                    handleRotateSvg(RotationDirection.Left)
                                }
                            >
                                <RotateLeft />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow title="Rotate 90 degrees right">
                            <IconButton
                                onClick={() =>
                                    handleRotateSvg(RotationDirection.Right)
                                }
                            >
                                <RotateRight />
                            </IconButton>
                        </Tooltip>
                        <Button
                            ref={copyToClipboardButtonRef}
                            className="svg-transformation__copytoclipboard-button"
                            onClick={() => handleCopyToClipboard(svgOuterHTML)}
                        >
                            Copy to clipboard
                        </Button>
                    </div>
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

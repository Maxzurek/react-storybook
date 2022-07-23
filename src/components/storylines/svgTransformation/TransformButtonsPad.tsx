import "./TransformButtonsPad.scss";

import { IconButton, Tooltip } from "@mui/material";
import { TransformDirection } from "./SvgTransformation.utils";
import {
    ArrowBack,
    ArrowDownward,
    ArrowForward,
    ArrowUpward,
    RotateLeft,
    RotateRight,
    ThreeSixty,
} from "@mui/icons-material";

interface TransformButtonsPadProps {
    onRotateSvg: (transformDirection: TransformDirection) => void;
    onTranslateSvg: (transformDirection: TransformDirection) => void;
    onFlipSvg: () => void;
}

export function TransformButtonsPad({
    onRotateSvg,
    onTranslateSvg,
    onFlipSvg,
}: TransformButtonsPadProps) {
    return (
        <div className="transform-buttons-pad__action-buttons">
            <div className="transform-buttons-pad__action-buttons-top-row">
                <div>Transform</div>
                <Tooltip
                    arrow
                    disableInteractive
                    placement="left"
                    title="Rotate 90 degrees left"
                >
                    <IconButton
                        onClick={() =>
                            onRotateSvg(TransformDirection.RotateLeft)
                        }
                    >
                        <RotateLeft />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    arrow
                    disableInteractive
                    placement="top"
                    title="Move up"
                >
                    <IconButton
                        onClick={() =>
                            onTranslateSvg(TransformDirection.MoveUp)
                        }
                    >
                        <ArrowUpward />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    arrow
                    disableInteractive
                    placement="right"
                    title="Rotate 90 degrees right"
                >
                    <IconButton
                        onClick={() =>
                            onRotateSvg(TransformDirection.RotateRight)
                        }
                    >
                        <RotateRight />
                    </IconButton>
                </Tooltip>
            </div>
            <div className="transform-buttons-pad__action-buttons-row">
                <Tooltip
                    arrow
                    disableInteractive
                    placement="left"
                    title="Move left"
                >
                    <IconButton
                        onClick={() =>
                            onTranslateSvg(TransformDirection.MoveLeft)
                        }
                    >
                        <ArrowBack />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    arrow
                    disableInteractive
                    placement="bottom"
                    title="Move down"
                >
                    <IconButton
                        onClick={() =>
                            onTranslateSvg(TransformDirection.MoveDown)
                        }
                    >
                        <ArrowDownward />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    arrow
                    disableInteractive
                    placement="right"
                    title="Move right"
                >
                    <IconButton
                        onClick={() =>
                            onTranslateSvg(TransformDirection.MoveRight)
                        }
                    >
                        <ArrowForward />
                    </IconButton>
                </Tooltip>
            </div>
            <div className="transform-buttons-pad__action-buttons-row">
                <Tooltip
                    arrow
                    disableInteractive
                    placement="bottom"
                    title="Flip 180 degrees"
                >
                    <IconButton onClick={onFlipSvg}>
                        <ThreeSixty />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
}

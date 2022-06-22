import SVGPathCommander from "svg-path-commander";
import { Potrace } from "./potrace";

export enum TransformDirection {
    RotateLeft,
    RotateRight,
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
}

export interface ViewBox {
    x: number;
    y: number;
}
export interface SvgData {
    viewBox: string;
    pathData: string;
}

const getViewboxObject = (viewBox: string) => {
    const viewBoxObject: ViewBox = {
        x: 0,
        y: 0,
    };

    const viewBoxAttributes = viewBox.split(" ");
    viewBoxObject.x = parseInt(viewBoxAttributes[2]);
    viewBoxObject.y = parseInt(viewBoxAttributes[3]);

    return viewBoxObject;
};

export const readFileAsText = async (file: File) => {
    return await file.text();
};

export const readFileAsDataUrl = (file: File) => {
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };
        reader.readAsDataURL(file);
    });
};

export const createAndLoadImage = (imageSrc: string) => {
    return new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            resolve(image);
        };
    });
};

export const potraceImage = (imageDataUrl: string) => {
    return new Promise<string>((resolve) => {
        Potrace.loadImageFromUrl(imageDataUrl);
        Potrace.setParameter();
        Potrace.process(async () => {
            resolve(Potrace.getSVG(1));
        });
    });
};

export const translateSvg = (
    svgData: SvgData,
    transformDirection: TransformDirection
) => {
    const viewBox: ViewBox = getViewboxObject(svgData.viewBox);
    const translatation = 30;
    const transform = {
        translate: [
            transformDirection === TransformDirection.MoveLeft ||
            transformDirection === TransformDirection.MoveRight
                ? (viewBox.x / translatation) *
                  (transformDirection === TransformDirection.MoveLeft ? -1 : 1)
                : 0,
            transformDirection === TransformDirection.MoveUp ||
            transformDirection === TransformDirection.MoveDown
                ? (viewBox.y / translatation) *
                  (transformDirection === TransformDirection.MoveUp ? -1 : 1)
                : 0,
        ], // X/Y translation
        rotate: 0, // Z axis rotation
        scale: 1, // uniform scale on X, Y, Z axis
        skew: 0, // skew 15deg on the X axis
        // origin: [0, 0], // if not specified, it will calculate a bounding box to determine a proper `transform-origin`
    };

    const optimizedPathData = new SVGPathCommander(svgData.pathData)
        .transform(transform)
        .optimize()
        .toString();

    svgData.pathData = optimizedPathData;

    return svgData;
};

export const rotateSvgPath = (svgData: SvgData, degrees: number) => {
    const transform = {
        translate: 0, // X axis translation
        rotate: degrees, // Z axis rotation
        scale: 1, // uniform scale on X, Y, Z axis
        skew: 0, // skew 15deg on the X axis
        // origin: [0, 0], // if not specified, it will calculate a bounding box to determine a proper `transform-origin`
    };

    const optimizedPathData = new SVGPathCommander(svgData.pathData)
        .transform(transform)
        .optimize()
        .toString();

    svgData.pathData = optimizedPathData;

    return svgData;
};

export const getElementAttribute = (element: Element) => {
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

export const concatElementDataToSvgData = (
    element: Element,
    svgData: SvgData
) => {
    const elementData = getElementAttribute(element);
    svgData.viewBox = elementData.viewBox
        ? elementData.viewBox
        : svgData.viewBox;
    svgData.pathData += elementData.pathData;

    return svgData;
};

export const parseSvgElementData = (element: Element, svgData: SvgData) => {
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

export const parseSvgString = (svgFileText: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgFileText, "image/svg+xml");
    const svgElement = svgDoc.children?.[0];

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
    const optimizedPathBbox = SVGPathCommander.getPathBBox(optimizedPathData);

    svgData.viewBox = `0 0 ${optimizedPathBbox.x2} ${optimizedPathBbox.y2}`;
    svgData.pathData = optimizedPathData;

    return svgData;
};

export const parseSvgFile = async (file: File) => {
    const svgString = await readFileAsText(file);
    return parseSvgString(svgString);
};

export const convertPngOrJpgFileToSvg = async (file: File) => {
    const fileDataUrl = await readFileAsDataUrl(file);
    const image = await createAndLoadImage(fileDataUrl);
    const canvasElement = document.createElement("canvas");
    const context2D = canvasElement.getContext("2d");
    canvasElement.width = image.width;
    canvasElement.height = image.height;
    if (context2D) {
        context2D.fillStyle = "white";
        context2D.fillRect(0, 0, image.width, image.height);
        context2D.drawImage(image, 0, 0);
    }
    const imageDataUrl = canvasElement.toDataURL();
    const svgString = await potraceImage(imageDataUrl);

    return await parseSvgString(svgString);
};

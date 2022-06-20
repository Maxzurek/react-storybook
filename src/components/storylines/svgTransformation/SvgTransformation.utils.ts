import SVGPathCommander from "svg-path-commander";
import potrace from "potrace";
import { Transform } from "./SvgTransformation";
export interface SvgData {
    viewBox: string;
    pathData: string;
}

export const translateSvg = (
    svgData: SvgData,
    moveDirection: Transform,
    translatation: number
) => {
    const transform = {
        translate: [
            moveDirection === Transform.MoveLeft ||
            moveDirection === Transform.MoveRight
                ? translatation
                : 0,
            moveDirection === Transform.MoveUp ||
            moveDirection === Transform.MoveDown
                ? translatation
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

export const getElementAttribute = async (element: Element) => {
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

export const concatElementDataToSvgData = async (
    element: Element,
    svgData: SvgData
) => {
    const elementData = await getElementAttribute(element);
    svgData.viewBox = elementData.viewBox
        ? elementData.viewBox
        : svgData.viewBox;
    svgData.pathData += elementData.pathData;

    return svgData;
};

export const parseSvgElementData = async (
    element: Element,
    svgData: SvgData
) => {
    let concatenatedSvgData: SvgData = await concatElementDataToSvgData(
        element,
        svgData
    );

    for (let index = 0; index < element.children.length; index++) {
        const child = element.children[index];

        concatenatedSvgData = await concatElementDataToSvgData(
            child,
            concatenatedSvgData
        );

        const childChildren = child.children;

        if (childChildren.length > 0) {
            concatenatedSvgData = await parseSvgElementData(
                child,
                concatenatedSvgData
            );
        }
    }

    return concatenatedSvgData;
};

export const parseSvgString = async (svgString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.children?.[0];

    let svgData: SvgData = {
        viewBox: "",
        pathData: "",
    };

    svgData = await parseSvgElementData(svgElement, svgData);

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

export const posterizeAndParseFile = async (file: File) => {
    let svgData: SvgData = {
        viewBox: "",
        pathData: "",
    };
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        potrace.posterize(
            reader.result as string,
            { threshold: 100 },
            async (err, svg) => {
                svgData = await parseSvgString(svg);
            }
        );
    };

    return svgData;
};

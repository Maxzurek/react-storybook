import { ReactNode, useEffect, useRef } from "react";

interface DraggableProps {
    children: ReactNode;
    sourceId: string;
    tooltipElement?: React.ReactElement;
    tooltipOffset?: { x: number; y: number };
    className?: string;
    isDisabled?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const Draggable = ({
    children,
    sourceId,
    tooltipElement,
    tooltipOffset,
    className,
    isDisabled,
    onDragStart,
    onDragEnd,
}: DraggableProps) => {
    const tooltipElementRef = useRef<HTMLDivElement>();
    const clonedTooltipElementContainerRef = useRef<HTMLDivElement>();

    useEffect(() => {
        return () => clonedTooltipElementContainerRef.current?.remove();
    }, []);

    const getClonedTooltipElementContainer = () => {
        if (!tooltipElementRef.current) return null;

        const clonedTooltipNode = tooltipElementRef.current.cloneNode(true);
        const clonedTooltipElementContainer = clonedTooltipNode.firstChild
            .parentElement as HTMLDivElement;

        return clonedTooltipElementContainer;
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", sourceId);

        const clonedTooltipElementContainer = getClonedTooltipElementContainer();

        if (clonedTooltipElementContainer) {
            clonedTooltipElementContainer.style.display = "flex";
            clonedTooltipElementContainer.style.position = "absolute";
            clonedTooltipElementContainer.style.left = "-9000px"; // We want to make sure the element is not visible in the body
            clonedTooltipElementContainerRef.current = clonedTooltipElementContainer;

            document.body.appendChild(clonedTooltipElementContainer);

            e.dataTransfer.setDragImage(
                clonedTooltipElementContainer,
                e.movementX + tooltipOffset?.x,
                e.movementY + tooltipOffset?.y
            );
        }

        onDragStart?.(e);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (clonedTooltipElementContainerRef.current) {
            clonedTooltipElementContainerRef.current.remove();
            clonedTooltipElementContainerRef.current = null;
        }

        onDragEnd?.(e);
    };

    return (
        <div
            className={className ? className : "draggable"}
            draggable={!isDisabled}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
        >
            {children}
            {tooltipElement && (
                <div
                    ref={tooltipElementRef}
                    className="draggable__tooltip-element-container"
                    style={{ display: "none" }}
                >
                    {tooltipElement}
                </div>
            )}
        </div>
    );
};

export default Draggable;

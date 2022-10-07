import { ReactNode } from "react";
import { draggableDataTransfer } from "./Draggable";

interface DropZoneProps {
    children: ReactNode;
    id: string;
    className?: string;
    onDrop?: (e: React.DragEvent<HTMLDivElement>, dataTransfer: DataTransfer) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>, dataTransfer: DataTransfer) => void;
    onDragLeave?: (e: React.DragEvent<HTMLDivElement>, dataTransfer: DataTransfer) => void;
}

const DropZone = ({ children, id, className, onDrop, onDragOver, onDragLeave }: DropZoneProps) => {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop?.(e, e.dataTransfer);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const data = e.dataTransfer.getData("text/plain");
        let dataTransfer = e.dataTransfer;

        if (!data) {
            dataTransfer = new DataTransfer();
            dataTransfer.setData("text/plain", draggableDataTransfer);
        }
        onDragOver?.(e, dataTransfer);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const data = e.dataTransfer.getData("text/plain");
        let dataTransfer;

        if (!data) {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData("text/plain", draggableDataTransfer);
        }

        onDragLeave?.(e, dataTransfer);
    };

    return (
        <div
            className={className ? className : "drop-zone"}
            id={id}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {children}
        </div>
    );
};

export default DropZone;

import { ReactNode } from "react";

interface DropZoneProps {
    children: ReactNode;
    id: string;
    className?: string;
    onDrop?: (e: React.DragEvent<HTMLDivElement>, sourceId: string) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>, sourceId: string) => void;
    onDragLeave?: (e: React.DragEvent<HTMLDivElement>, sourceId: string) => void;
}

const DropZone = ({ children, id, className, onDrop, onDragOver, onDragLeave }: DropZoneProps) => {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop?.(e, e.dataTransfer.getData("text/plain"));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver?.(e, e.dataTransfer.getData("text/plain"));
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onDragLeave?.(e, e.dataTransfer.getData("text/plain"));
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

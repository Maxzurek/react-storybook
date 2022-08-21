export interface RootFolderProps {
    children?: JSX.Element[];
}

export default function RootFolder({ children }: RootFolderProps) {
    return <div className="root-folder">{children}</div>;
}

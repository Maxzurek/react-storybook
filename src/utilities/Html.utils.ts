export const withClassNames = (classNames: string[]) => {
    return classNames.filter(Boolean).join(" ");
};

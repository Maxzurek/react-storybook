export const withClassNames = (classNames: string[]) => {
    return classNames.filter(Boolean).join(" ");
};

export const getScrollBarWidth = () => {
    const element = document.createElement("div");
    element.style.cssText = "overflow:scroll; visibility:hidden; position:absolute;";
    document.body.appendChild(element);

    const width = element.offsetWidth - element.clientWidth;

    element.remove();

    return width;
};

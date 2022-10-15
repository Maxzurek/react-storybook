import "./Slider.scss";

export default function Slider({
    ...props
}: Omit<React.DetailedHTMLProps<React.HTMLProps<HTMLInputElement>, HTMLInputElement>, "type">) {
    const sliderClassNames = ["slider", props.className];

    return <input {...props} className={sliderClassNames.join(" ")} type="range" />;
}

import "./CarouselIndex.scss";

import Carousel from "./Carousel";
import { ReactElement, useRef, useState } from "react";
import Slider from "../../slider/Slider";

const initialSlides: ReactElement[] = [
    <div
        key="carousel-slide-1"
        className="carousel-index__slide"
        style={{ backgroundColor: "red", width: "25%" }}
    >
        Slide 1 25%
    </div>,
    <div
        key="carousel-slide-2"
        className="carousel-index__slide"
        style={{ backgroundColor: "purple", width: "50%" }}
    >
        Slide 2 50%
    </div>,
    <div
        key="carousel-slide-3"
        className="carousel-index__slide"
        style={{ backgroundColor: "orange", width: "75%" }}
    >
        Slide 3 75%
    </div>,
    <div
        key="carousel-slide-4"
        className="carousel-index__slide"
        style={{ backgroundColor: "green" }}
    >
        Slide 4 100%
    </div>,
];

export default function CarouselSlides() {
    const [slides, setSlides] = useState(initialSlides);
    const [visibleSlideIndex, setVisibleSlideIndex] = useState(0);
    const [animationDuration, setAnimationDuration] = useState(0.3);
    const [
        areTransitionButtonsDisabledWhenAnimating,
        setAreTransitionButtonsDisabledWhenAnimating,
    ] = useState(false);

    const isAnimatingRef = useRef(false);

    const sliderMinValue = 0;
    const sliderMaxValue = 3;
    const sliderStepValue = 0.1;

    const handleChangeAnimationDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
        const animationDuration = Number(e.target.value);

        setAnimationDuration(animationDuration);
    };

    const handleAddSlide = () => {
        const newNumOfSlide = slides.length + 1;

        setSlides([
            ...slides,
            <div
                key={`carousel-slide-${newNumOfSlide}`}
                className="carousel-index__slide"
                style={{ backgroundColor: "blue" }}
            >
                Added slide {newNumOfSlide}
            </div>,
        ]);
    };

    const handleResetSlides = () => {
        setSlides(initialSlides);
        setVisibleSlideIndex(0);
    };

    const handleAnimationStart = () => {
        isAnimatingRef.current = true;
    };

    const handleAnimationEnd = () => {
        isAnimatingRef.current = false;
    };

    const handleSlideLeft = () => {
        if (areTransitionButtonsDisabledWhenAnimating && isAnimatingRef.current) return;

        const newIndex = visibleSlideIndex - 1 < 0 ? slides.length - 1 : visibleSlideIndex - 1;

        setVisibleSlideIndex(newIndex);
    };

    const handleClickSlideIndicator = (slideIndex: number) => () => {
        setVisibleSlideIndex(slideIndex);
    };

    const handleSlideRight = () => {
        if (areTransitionButtonsDisabledWhenAnimating && isAnimatingRef.current) return;

        const newIndex = visibleSlideIndex + 1 > slides.length - 1 ? 0 : visibleSlideIndex + 1;

        setVisibleSlideIndex(newIndex);
    };

    const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAreTransitionButtonsDisabledWhenAnimating(e.target.checked);
        isAnimatingRef.current = false;
    };

    return (
        <div className="carousel-index">
            <div className="carousel-index__header">
                <div className="carousel-index__slider-container">
                    <div className="carousel-index__slider-title">
                        Animation duration ({animationDuration}s)
                    </div>
                    <Slider
                        max={sliderMaxValue}
                        min={sliderMinValue}
                        step={sliderStepValue}
                        value={animationDuration}
                        onChange={handleChangeAnimationDuration}
                    />
                </div>
                <div className="carousel-index__action-button-container">
                    <button
                        className="story__button carousel-index__button-add-slide"
                        onClick={handleAddSlide}
                    >
                        Add slide
                    </button>
                    <button
                        className="story__button carousel-index__button-reset-slides"
                        onClick={handleResetSlides}
                    >
                        Reset slides
                    </button>
                </div>
            </div>
            <Carousel
                animationDuration={animationDuration}
                animationTimingFunction="ease-out"
                className="carousel-index__carousel"
                visibleSlideIndex={visibleSlideIndex}
                onAnimationEnd={handleAnimationEnd}
                onAnimationStart={handleAnimationStart}
            >
                {slides}
            </Carousel>
            <div className="carousel-index__action-button-container carousel-index__footer-action-button-container">
                <div className="carousel-index__slide-transition-action-button-container">
                    <button
                        className="story__button carousel-index__transition-button"
                        onClick={handleSlideLeft}
                    >
                        Previous
                    </button>
                    {slides.map((_, index) => {
                        const isSlideSelected = index === visibleSlideIndex;
                        const buttonSlideIndicatorClassNames = [
                            "carousel-index__button-slide-indicator",
                            isSlideSelected && "carousel-index__button-slide-indicator--active",
                        ];

                        return (
                            <button
                                key={`button-slide-indicator-${index}`}
                                className={buttonSlideIndicatorClassNames.join(" ")}
                                onClick={handleClickSlideIndicator(index)}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                    <button
                        className="story__button carousel-index__transition-button"
                        onClick={handleSlideRight}
                    >
                        Next
                    </button>
                </div>
                <div className="carousel-index__checkbox-disable-transition-buttons-container">
                    <label
                        className="carousel-index__checkbox-disable-transition-buttons-label"
                        htmlFor="carousel-index__checkbox"
                    >
                        Prevent slide transition during animations:
                    </label>
                    <input
                        checked={areTransitionButtonsDisabledWhenAnimating}
                        className="carousel-index__checkbox-disable-transition"
                        id="carousel-index__check-box"
                        type="checkbox"
                        onChange={handleChangeCheckbox}
                    />
                </div>
            </div>
        </div>
    );
}

import "./Carousel.scss";

import { ReactElement } from "react";
import { usePrevious } from "../../../hooks/usePrevious";

enum SlideDirection {
    Left,
    Right,
}

export interface CarouselProps
    extends Omit<
        React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLDivElement>,
        | "onAnimationStart"
        | "onAnimationStartCapture"
        | "onAnimationIteration"
        | "onAnimationIterationCapture"
        | "onAnimationEnd"
        | "onAnimationEndCapture"
    > {
    children: ReactElement[];
    visibleSlideIndex: number;
    className?: string;
    animationDuration?: number;
    animationTimingFunction?: "ease" | "ease-in" | "ease-in-out" | "ease-out";
    onAnimationStart?: (e: React.AnimationEvent<HTMLDivElement>) => void;
    onAnimationStartCapture?: (e: React.AnimationEvent<HTMLDivElement>) => void;
    onAnimationIteration?: (e: React.AnimationEvent<HTMLDivElement>) => void;
    onAnimationIterationCapture?: (e: React.AnimationEvent<HTMLDivElement>) => void;
    onAnimationEnd?: (e: React.AnimationEvent<HTMLDivElement>) => void;
    onAnimationEndCapture?: (e: React.AnimationEvent<HTMLDivElement>) => void;
}

export default function Carousel({
    children: slides,
    visibleSlideIndex,
    className,
    animationDuration = 0.3,
    animationTimingFunction,
    onAnimationStart,
    onAnimationStartCapture,
    onAnimationIteration,
    onAnimationIterationCapture,
    onAnimationEnd,
    onAnimationEndCapture,
    ...carouselDivProps
}: CarouselProps) {
    const numberOfSlides = slides.length;
    const hasMoreThanTwoSlides = slides.length > 2;
    const lastSlideIndex = numberOfSlides - 1;
    const isVisibleSlideFirst = visibleSlideIndex === 0;
    const isVisibleSlideLast = visibleSlideIndex === lastSlideIndex;
    const slideIndexBeforeVisibleSlideIndex = isVisibleSlideFirst
        ? lastSlideIndex
        : visibleSlideIndex - 1;
    const previousVisibleSlideIndex = usePrevious(visibleSlideIndex);
    const isPreviousSlideFirst = previousVisibleSlideIndex === 0;
    const isPreviousSlideLast = previousVisibleSlideIndex === lastSlideIndex;

    const getSlideDirection = () => {
        if (hasMoreThanTwoSlides) {
            if (isPreviousSlideLast && isVisibleSlideFirst) {
                return SlideDirection.Right;
            } else if (isPreviousSlideFirst && isVisibleSlideLast) {
                return SlideDirection.Left;
            }
        }

        if (previousVisibleSlideIndex < visibleSlideIndex) {
            return SlideDirection.Left;
        }

        return SlideDirection.Right;
    };

    const slideDirection = getSlideDirection();
    const isTouched =
        previousVisibleSlideIndex !== undefined && previousVisibleSlideIndex !== visibleSlideIndex;

    if (visibleSlideIndex !== undefined && visibleSlideIndex != null) {
        const keyOfVisibleSlide = slides[visibleSlideIndex]?.key;

        if (!keyOfVisibleSlide) {
            console.error(
                `Carousel - No key provided for child at index ${visibleSlideIndex}. Each child of the carousel must have a unique key.`
            );
        }
    }

    const handleCarouselDivRefCallback = (node: HTMLDivElement) => {
        if (node) {
            node.style.setProperty("--animation-duration", `${animationDuration.toString()}s`);
            node.style.setProperty("--animation-timing-function", animationTimingFunction);
        }
    };

    const carouselClassName = ["carousel", className];
    const visibleSlideClassNames = [
        "carousel__visible-slide",
        isTouched &&
            slideDirection === SlideDirection.Left &&
            "carousel__visible-slide--slide-left",
        isTouched &&
            slideDirection === SlideDirection.Right &&
            "carousel__visible-slide--slide-right",
    ].filter(Boolean);
    const previousVisibleSlideClassNames = [
        "carousel__previous-visible-slide",
        isTouched &&
            slideDirection === SlideDirection.Left &&
            "carousel__previous-visible-slide--slide-left",
        isTouched &&
            slideDirection === SlideDirection.Right &&
            "carousel__previous-visible-slide--slide-right",
    ].filter(Boolean);

    return (
        <div
            ref={handleCarouselDivRefCallback}
            className={carouselClassName.join(" ")}
            {...carouselDivProps}
        >
            <div className="carousel__slide-container">
                <div
                    key={slides[visibleSlideIndex]?.key}
                    className={visibleSlideClassNames.join(" ")}
                    onAnimationEnd={onAnimationEnd}
                    onAnimationEndCapture={onAnimationEndCapture}
                    onAnimationIteration={onAnimationIteration}
                    onAnimationIterationCapture={onAnimationIterationCapture}
                    onAnimationStart={onAnimationStart}
                    onAnimationStartCapture={onAnimationStartCapture}
                >
                    {slides[visibleSlideIndex]}
                </div>
                <div
                    key={
                        slides[
                            previousVisibleSlideIndex === visibleSlideIndex
                                ? slideIndexBeforeVisibleSlideIndex
                                : previousVisibleSlideIndex
                        ]?.key
                    }
                    className={previousVisibleSlideClassNames.join(" ")}
                >
                    {slides[previousVisibleSlideIndex]}
                </div>
            </div>
        </div>
    );
}

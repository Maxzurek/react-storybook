import "./ExpandableDivIndex.scss";

import React, { useRef, useState } from "react";
import useRefCallback from "../../../hooks/useRefCallback";
import Slider from "../../slider/Slider";
import ExpandableDiv, { ExpansionDirection } from "./ExpandableDiv";
import FolderTreeIndex from "../folderTree/FolderTreeIndex";

export default function ExpandableDivIndex() {
    const [indexesOfExpandedDivs, setIndexesOfExpandedDivs] = useState<number[]>([]);
    const [animationDuration, setAnimationDuration] = useState(250);
    const [expansionDirection, setExpansionDirection] = useState<ExpansionDirection>("vertical");

    const { getNode: getExpandableDivNode, setRefCallback: setExpandableDivRefCallback } =
        useRefCallback<HTMLDivElement>();

    const indexOfExpandableDivToScrollIntoView = useRef<number>();

    const numberOExpandableDiv = 3;
    const expandableDivs = Array.from(Array(numberOExpandableDiv).keys());
    const minSliderValue = 0;
    const maxSliderValue = 3000;
    const stepSliderValue = 100;
    const areAllDivExpanded = indexesOfExpandedDivs.length === numberOExpandableDiv;

    const handleExpandOrCollapseAllItems = () => {
        if (areAllDivExpanded) {
            setIndexesOfExpandedDivs([]);
        } else {
            setIndexesOfExpandedDivs(Array.from(Array(numberOExpandableDiv).keys()));
        }
    };

    const handleClickItemHeader = (isExpanding: boolean, indexOfExpandableDiv: number) => () => {
        if (isExpanding) {
            indexOfExpandableDivToScrollIntoView.current = indexOfExpandableDiv;
            setIndexesOfExpandedDivs([...indexesOfExpandedDivs, indexOfExpandableDiv]);
        } else {
            const filteredExpandedDivIndexes = indexesOfExpandedDivs.filter(
                (expandedDivIndex) => expandedDivIndex !== indexOfExpandableDiv
            );
            setIndexesOfExpandedDivs(filteredExpandedDivIndexes);
        }
    };

    const handleChangeAnimationDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAnimationDuration = Number(e.target.value);

        setAnimationDuration(newAnimationDuration);
    };

    const handleChangeExpansionDirection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newExpansionDuration = e.target.value;

        setExpansionDirection((newExpansionDuration as string).toLowerCase() as ExpansionDirection);
    };

    const handleTransitionEndExpandedDiv = (indexOfExpandableDiv: number) => () => {
        const isExpanded = indexesOfExpandedDivs.some(
            (expandedDivIndex) => expandedDivIndex === indexOfExpandableDiv
        );
        const isScrollIntoViewNeeded =
            indexOfExpandableDivToScrollIntoView.current === indexOfExpandableDiv;

        if (!isExpanded || !isScrollIntoViewNeeded) return;

        getExpandableDivNode(indexOfExpandableDiv.toString())?.scrollIntoView({
            block: "nearest",
            inline: "center",
            behavior: "smooth",
        });
        indexOfExpandableDivToScrollIntoView.current = undefined;
    };

    const handleExpandableDivIndexRefCallback = (node: HTMLDivElement) => {
        if (node) {
            node.style.setProperty(
                "--animation-duration",
                `${(animationDuration / 1000).toString()}s`
            );
        }
    };

    return (
        <div ref={handleExpandableDivIndexRefCallback} className="expandable-div-index">
            <div className="expandable-div-index__header">
                <div className="expandable-div-index__setting-container">
                    <div className="expandable-div-index__setting-name">
                        Animation duration ({animationDuration}s):
                    </div>
                    <div className="expandable-div-index__setting-component">
                        <Slider
                            max={maxSliderValue}
                            min={minSliderValue}
                            step={stepSliderValue}
                            value={animationDuration}
                            onChange={handleChangeAnimationDuration}
                        />
                    </div>
                </div>
                <div className="expandable-div-index__setting-container">
                    <div className="expandable-div-index__setting-name">Expansion direction:</div>
                    <div className="expandable-div-index__setting-component">
                        <select
                            value={expansionDirection}
                            onChange={handleChangeExpansionDirection}
                        >
                            <option value="vertical">Vertical</option>
                            <option value="horizontal">Horizontal</option>
                            <option value="diagonal">Diagonal</option>
                        </select>
                    </div>
                </div>
                <div className="expandable-div-index__header-info-text">
                    (Items clicked will automatically be scrolled into view after expanding, if
                    needed)
                </div>
            </div>
            <button
                className="expandable-div-index__expand-collapse-button story__button"
                onClick={handleExpandOrCollapseAllItems}
            >
                {areAllDivExpanded ? "Collapse all" : "Expand all"}
            </button>
            {expandableDivs.map((_, index) => {
                const isExpanded = indexesOfExpandedDivs.some(
                    (expandedDivIndex) => expandedDivIndex === index
                );
                const expandableItemClassNames = [
                    "expandable-div-index__expandable-div-container",
                    isExpanded && "expandable-div-index__expandable-div-container--expanded",
                ].filter(Boolean);

                return (
                    <div
                        key={`expandable-div-index__expandable-div-${index}`}
                        className={expandableItemClassNames.join(" ")}
                    >
                        <div
                            className="expandable-div-index__expandable-div-header"
                            onClick={handleClickItemHeader(!isExpanded, index)}
                        >
                            Click me to {isExpanded ? "collapse" : "expand"}
                        </div>
                        <ExpandableDiv
                            ref={(node) => setExpandableDivRefCallback(index.toString(), node)}
                            animationDuration={animationDuration}
                            className="expandable-div-index__expandable-div"
                            expansionDirection={expansionDirection}
                            isExpanded={isExpanded}
                            onTransitionEnd={handleTransitionEndExpandedDiv(index)}
                        >
                            <FolderTreeIndex />
                        </ExpandableDiv>
                    </div>
                );
            })}
        </div>
    );
}

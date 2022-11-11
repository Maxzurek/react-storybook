import "./HexColorGuessingGame.scss";

import { useRef, useState } from "react";

export default function HexColorGuessingGame() {
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(-1);
    const [colorChoices, setColorChoices] = useState([]);
    const [isWrongAnswer, setIsWrongAnswer] = useState(false);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

    const colorContainerRef = useRef<HTMLDivElement>();
    const resultTextRef = useRef<HTMLSpanElement>();
    const isNewGameRef = useRef(true);

    const handleStartNewGame = () => {
        const numberOfChoices = 3;
        const randomColorChoices = generateRandomColorChoices(numberOfChoices);
        const randomCorrectAnswerIndex = generateRandomNumberFromRange(0, numberOfChoices);

        setColorChoices(randomColorChoices);
        setCorrectAnswerIndex(randomCorrectAnswerIndex);
        setIsWrongAnswer(undefined);

        isNewGameRef.current = false;
    };

    const handleHideResultText = () => {
        resultTextRef.current.style.display = "none";
    };

    const handleShowResultText = () => {
        resultTextRef.current.style.display = "block";
    };

    const handleAnswer = (answerIndex: number) => () => {
        const isCorrectAnswer = correctAnswerIndex === answerIndex;

        if (!isCorrectAnswer) {
            setIsWrongAnswer(true);
            setIsCorrectAnswer(false);
        } else {
            setIsCorrectAnswer(true);
            setIsWrongAnswer(false);
            handleStartNewGame();
        }

        handleShowResultText();
    };

    const handleColorContainerRefCallback = (node: HTMLDivElement) => {
        if (node) {
            node.style.setProperty("--color-container-color", colorChoices[correctAnswerIndex]);
            colorContainerRef.current = node;
        }
    };

    const handleResultTextAnimationEnd = () => {
        if (isCorrectAnswer) {
            handleHideResultText();
        }
    };

    if (isNewGameRef.current) {
        handleStartNewGame();
        isNewGameRef.current = false;
    }

    const resultTextClassNames = [
        "hex-color-guessing-game__result-text",
        isWrongAnswer && "hex-color-guessing-game__result-text--wrong-answer",
        isCorrectAnswer && "hex-color-guessing-game__result-text--correct-answer",
    ].filter(Boolean);

    return (
        <div className="hex-color-guessing-game">
            <span className="hex-color-guessing-game__header-text">{"Guess the hex color"}</span>
            <div
                ref={handleColorContainerRefCallback}
                className="hex-color-guessing-game__color-container"
            />
            <div className="hex-color-guessing-game__answer-buttons-container">
                {colorChoices.map((color, index) => (
                    <button
                        key={color}
                        className="hex-color-guessing-game__answer-button"
                        onClick={handleAnswer(index)}
                    >
                        {color}
                    </button>
                ))}
            </div>
            <span
                ref={resultTextRef}
                className={resultTextClassNames.join(" ")}
                onAnimationEnd={handleResultTextAnimationEnd}
            >
                {isWrongAnswer && "Wrong answer"}
                {isCorrectAnswer && "Correct answer!"}
            </span>
        </div>
    );
}

interface HexColor {
    red: string;
    green: string;
    blue: string;
}

const generateRandomColorChoices = (numberOfChoices: number) => {
    const randomColorChoices: string[] = [];

    Array.from(Array(numberOfChoices).keys()).forEach(() => {
        const randomHexColor = generateRandomHexColor();
        randomColorChoices.push(randomHexColor);
    });

    return randomColorChoices;
};

const generateRandomHexColor = () => {
    const possibleValues = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
    ];

    const hexColor: HexColor = {
        red: null,
        green: null,
        blue: null,
    };

    let key: keyof typeof hexColor;

    for (key in hexColor) {
        const randomIndexOne = generateRandomNumberFromRange(0, possibleValues.length);
        const randomIndexTwo = generateRandomNumberFromRange(0, possibleValues.length);

        const firstHexDigit = possibleValues[randomIndexOne];
        const secondHexDigit = possibleValues[randomIndexTwo];

        hexColor[key] = `${firstHexDigit}${secondHexDigit}`;
    }

    return `#${hexColor.red}${hexColor.green}${hexColor.blue}`;
};

const generateRandomNumberFromRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

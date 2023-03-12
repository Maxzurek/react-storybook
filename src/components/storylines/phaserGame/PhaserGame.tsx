import { useRef, useEffect, useState } from "react";
import { gameConfig } from "./configs/GameConfig";
import { useGameDispatch, useGameState } from "./contexts/Game.context";

export default function PhaserGame() {
    const gameState = useGameState();
    const gameDispatch = useGameDispatch();

    const [isFullScreen, setIsFullScreen] = useState(false);

    const isGameBooted = useRef(false);

    useEffect(() => {
        if (!isGameBooted.current) {
            const game = new Phaser.Game(gameConfig);
            gameDispatch({ type: "setGame", payload: game });
            isGameBooted.current = game.isBooted;
        }
    }, [gameDispatch, isGameBooted]);

    const handleGoFullScreen = () => {
        const nextIsFullScreen = !isFullScreen;
        setIsFullScreen(nextIsFullScreen);

        if (nextIsFullScreen) {
            gameState.game.scale.scaleMode = Phaser.Scale.NONE;
        } else {
            gameState.game.scale.scaleMode = Phaser.Scale.FIT;
        }

        gameState.game.scale.toggleFullscreen();
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button className="story__button" onClick={handleGoFullScreen}>
                Full screen
            </button>
        </div>
    );
}

import { useRef, useEffect } from "react";
import { gameConfig } from "./configs/GameConfig";
import { useGameDispatch, useGameState } from "./contexts/Game.context";

export default function PhaserGame() {
    const gameState = useGameState();
    const gameDispatch = useGameDispatch();

    const isGameBooted = useRef(false);

    useEffect(() => {
        if (!isGameBooted.current) {
            const game = new Phaser.Game(gameConfig);
            gameDispatch({ type: "setGame", payload: game });
            isGameBooted.current = game.isBooted;
        }
    }, [gameDispatch, isGameBooted]);

    const handleGoFullScreen = () => {
        gameState.game.scale.scaleMode = Phaser.Scale.NONE;
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

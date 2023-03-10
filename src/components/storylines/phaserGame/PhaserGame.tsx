import { useRef, useEffect } from "react";
import { gameConfig } from "./configs/GameConfig";
import { useGameDispatch } from "./contexts/Game.context";

export default function PhaserGame() {
    const gameDispatch = useGameDispatch();

    const isGameBooted = useRef(false);

    useEffect(() => {
        if (!isGameBooted.current) {
            const game = new Phaser.Game(gameConfig);
            gameDispatch({ type: "setGame", payload: game });
            isGameBooted.current = game.isBooted;
        }
    }, [gameDispatch, isGameBooted]);

    return <></>;
}

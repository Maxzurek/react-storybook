import "./PhaseGameIndex.scss";

import { gameParentContainerId } from "./configs/GameConfig";
import { GameProvider } from "./contexts/Game.context";
import PhaserGame from "./PhaserGame";

export default function PhaserGameIndex() {
    return (
        <GameProvider>
            <div className="phase-game-index" id={gameParentContainerId} />
            <PhaserGame />
        </GameProvider>
    );
}

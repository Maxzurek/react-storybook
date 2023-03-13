import "./PhaseGameIndex.scss";

import { gameParentContainerId } from "./configs/GameConfig";
import { GameProvider } from "./contexts/Game.context";
import PhaserGame from "./PhaserGame";

export default function PhaserGameIndex() {
    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
    };

    return (
        <GameProvider>
            <div
                className="phase-game-index"
                id={gameParentContainerId}
                onContextMenu={handleContextMenu}
            />
            <PhaserGame />
        </GameProvider>
    );
}

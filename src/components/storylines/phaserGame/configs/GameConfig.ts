import Phaser from "phaser";
import { Dimension } from "../interfaces/Global.interfaces";
import Game from "../scenes/Game";
import castleMap from "../tiled/castleMap.json";
import Preloader from "../scenes/Preloader";

export const gameParentContainerId = "game-parent-container";

type GameConfig = Phaser.Types.Core.GameConfig;

export const mapSize: Dimension = {
    width: castleMap.width * castleMap.tilewidth,
    height: castleMap.height * castleMap.tileheight,
};

export const gameConfig: GameConfig = {
    type: Phaser.AUTO,
    width: mapSize.width,
    height: mapSize.height,
    parent: gameParentContainerId,
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
    scale: {
        parent: gameParentContainerId,
        mode: Phaser.Scale.FIT,
    },
    disableContextMenu: true,
    scene: [Preloader, Game],
};

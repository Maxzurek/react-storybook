import Phaser from "phaser";
import { Dimension } from "../interfaces/Global.interfaces";
import Game from "../scenes/Game";
import castleMap from "../maps/castleMap.json";
import Preloader from "../scenes/Preloader";

export const gameParentContainerId = "game-parent-container";

type GameConfig = Phaser.Types.Core.GameConfig;

export const gameScale = 1.25;
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
            debug: false,
        },
    },
    scale: {
        parent: gameParentContainerId,
        mode: Phaser.Scale.FIT,
    },
    scene: [Preloader, Game],
};

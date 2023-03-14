import castleMap from "../tiled/castleMap.json";

export const tiledMapConfig = {
    castle: {
        size: {
            width: castleMap.width,
            height: castleMap.height,
        },
        layerId: {
            ui: "layer-ui",
            uiBackground: "layer-ui-background",
            props: "layer-props",
            wallSide: "layer-wall-side",
            wallTop: "layer-wall-top",
            groundInteractive: "layer-ground-interactive",
            groundBase: "layer-ground-base",
            groundPlayer: "layer-ground-player",
            groundEnemy: "layer-ground-enemy",
            tower: "layer-tower",
        },
        tileSetName: {
            props: "tx-props",
            grass: "tx-tileset-grass",
            stoneGround: "tx-tileset-stone-ground",
            wall: "tx-tileset-wall",
            ui: "tx-ui",
        },
        tiles: {
            width: castleMap.tilewidth,
            height: castleMap.tileheight,
        },
    },
};

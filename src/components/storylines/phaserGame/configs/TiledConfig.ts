export const tiledMapConfig = {
    castle: {
        layerId: {
            ui: "layer-ui",
            uiBackground: "layer-ui-background",
            props: "layer-props",
            wallSide: "layer-wall-side",
            wallTop: "layer-wall-top",
            groundInteractive: "layer-ground-interactive",
            groundPlayer: "layer-ground-player",
            groundEnemy: "layer-ground-enemy",
        },
        tileSetName: {
            props: "tx-props",
            grass: "tx-tileset-grass",
            stoneGround: "tx-tileset-stone-ground",
            wall: "tx-tileset-wall",
            ui: "tx-ui",
        },
        tiles: {
            width: 32,
            height: 32,
        },
    },
};

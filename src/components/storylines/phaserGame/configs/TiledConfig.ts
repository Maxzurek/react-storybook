export const tiledMapConfig = {
    castle: {
        layerId: {
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
            wall: "tx-tileset-wall",
            ui: "tx-ui",
        },
        tiles: {
            width: 32,
            height: 32,
        },
    },
};

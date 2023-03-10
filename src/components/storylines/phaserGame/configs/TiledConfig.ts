export const tiledMapConfig = {
    castle: {
        layerId: {
            props: "layer-props",
            wallOne: "layer-wall-one",
            wallTwo: "layer-wall-two",
            groundInteractive: "layer-ground-interactive",
            ground: "layer-ground",
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

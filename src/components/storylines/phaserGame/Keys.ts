export const textureKeys = {
    tileSet: {
        stoneGround: "tile-set-stone-ground",
        grass: "tile-set-grass",
        wall: "tile-set-wall",
        props: "tile-set-props",
        ui: "tile-set-ui",
    },
    sprites: "sprites",
    map: {
        castle: "map-castle",
        ui: "map-ui",
    },
    towers: {
        crossbow: "tower-crossbow",
    },
    weapons: {
        crossbow: "weapon-tower-crossbow",
    },
    projectiles: {
        crossbow: "projectile-tower-crossbow",
    },
};

export const layerKeys = {
    ground: {
        base: "layer-ground-base",
        player: "layer-ground-player",
        enemy: "layer-ground-enemy",
        interactive: "layer-ground-interactive",
    },
    wall: {
        top: "layer-wall-top",
        side: "layer-wall-side",
    },
    props: "layer-props",
    tower: {
        buildable: "layer-tower-buildable",
        built: "layer-tower-built",
    },
};

export const sceneKeys = {
    preload: "scene-preload",
    game: "scene-game",
    ui: "scene-ui",
};

export const animationKeys = {
    player: {
        idle: "player-idle",
        walk: "player-walk",
    },
    enemy: {
        idle: "enemy-idle",
        walk: "enemy-walk",
    },
    weapon: {
        fire: "weapon-fire",
        reload: "weapon-reload",
    },
    projectile: {
        launch: "projectile-launch",
    },
};

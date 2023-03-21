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
        buildingInProgress: "tower-building-in-progress",
        crossbow: "tower-crossbow",
    },
    weapons: {
        crossbow: "weapon-tower-crossbow",
    },
    projectiles: {
        crossbow: "projectile-tower-crossbow",
    },
    images: {
        blank: "image-blank",
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
        idle: "animation-player-idle",
        walk: "animation-player-walk",
    },
    enemy: {
        idle: "animation-enemy-idle",
        walk: "animation-enemy-walk",
    },
    weapon: {
        fire: "animation-weapon-fire",
        reload: "animation-weapon-reload",
    },
    projectile: {
        launch: "animation-projectile-launch",
    },
    tower: {
        buildingInProgress: "animation-tower-building-in-progress",
        buildingDone: "animation-tower-building-done",
    },
};

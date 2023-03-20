const sceneEvents = new Phaser.Events.EventEmitter();
const spriteEvents = new Phaser.Events.EventEmitter();

const eventKeys = {
    gameScene: {
        spawnEnemy: "game-scene-spawn-enemy",
        towerAdded: "game-scene-tower-added",
        buildTower: "game-scene-build-tower",
    },
    sprite: {
        pathChanged: "sprite-path-changed",
        PathTargetReached: "sprite-path-target-reached",
    },
    uiScene: {
        updatePanelInfo: "ui-scene-update-panel-info",
        setTargetFrame: "ui-scene-set-target-frame",
    },
};

export { sceneEvents, spriteEvents, eventKeys };

const sceneEvents = new Phaser.Events.EventEmitter();

const eventKeys = {
    gameScene: {
        createEnemies: "game-scene-create-enemies",
        spawnEnemy: "game-scene-spawn-enemy",
        towerAdded: "game-scene-tower-added",
    },
    uiScene: {
        updatePanelInfo: "ui-scene-update-panel-info",
        setTargetFrame: "ui-scene-set-target-frame",
    },
};

export { sceneEvents, eventKeys };

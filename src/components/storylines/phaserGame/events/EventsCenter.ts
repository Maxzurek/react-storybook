const sceneEvents = new Phaser.Events.EventEmitter();

const eventKeys = {
    gameScene: {
        createEnemies: "game-scene-create-enemies",
        spawnEnemy: "game-scene-spawn-enemy",
    },
    uiScene: {
        updatePanelInfo: "ui-scene-update-panel-info",
        setTargetFrame: "ui-scene-set-target-frame",
    },
};

export { sceneEvents, eventKeys };

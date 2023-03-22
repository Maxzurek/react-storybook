const gameEvents = new Phaser.Events.EventEmitter();

const eventKeys = {
    from: {
        gameScene: {
            /**
             * Arg: Class type of the sprite to be displayed in the target frame - @external Function
             */
            setTargetFrame: "ui-scene-set-target-frame",
            /**
             * Arg: Object Tower added - @external Tower
             */
            towerAdded: "game-scene-tower-added",
            /**
             * Arg: The text to display - string
             * Arg: The duration of the alert (-1 for infinity) - number
             */
            showAlert: "game-scene-show-alert",
        },
        uiScene: {
            /**
             * Arg: Enum type of the tower to be build - @external TowerType
             */
            buildTower: "ui-scene-build-tower",
        },
        enemyWaveManager: {
            /**
             * Arg: Text fields to be updated - @external TextFieldUpdate
             */
            updatePanelInfo: "ui-scene-update-panel-info",
            /**
             * Arg: Enum type of the enemy to be spawned - @external EnemyType
             */
            spawnEnemy: "enemy-wave-manager-spawn-enemy",
        },
        sprite: {
            pathChanged: "sprite-path-changed",
            pathTargetReached: "sprite-path-target-reached",
        },
        enemy: {
            died: "enemy-died",
            finalDestinationReached: "enemy-final-destination-reached",
        },
        resourceManager: {
            noLivesRemaining: "resource-manager-no-lives-remaining",
        },
    },
};

export { gameEvents, eventKeys };

const gameEvents = new Phaser.Events.EventEmitter();

const eventKeys = {
    from: {
        gameScene: {
            /**
             * Arg: Object Tower added - @external Tower
             */
            towerAdded: "game-scene-tower-added",
        },
        uiScene: {
            /**
             * Arg: Enum type of the tower to be build - @external TowerType
             */
            activateBuildMode: "ui-scene-activate-build-mode",
        },
        enemyWaveManager: {
            /**
             * Arg: Enum type of the enemy to be spawned - @external EnemyType
             */
            spawnEnemy: "enemy-wave-manager-spawn-enemy",
        },
        player: {
            pathChanged: "player-path-changed",
            pathFinalDestinationReached: "player-path-final-destination-reached",
        },
        enemy: {
            /**
             * Arg: The object Enemy that died - @external Enemy
             */
            died: "enemy-died",
            finalDestinationReached: "enemy-final-destination-reached",
            /**
             * Arg: The object Enemy that is destroying the tower - @external Enemy
             * Arg: The tower tile position: @external Phaser.Math.Vector2
             */
            destroyTowerAt: "enemy-destroy-tower-at",
        },
        resourceManager: {
            noLivesRemaining: "resource-manager-no-lives-remaining",
            /**
             * Arg: The number of lives remaining - number
             */
            livesChanged: "resource-manager-lives-changed",
            /**
             * Arg: The number of gold available - number
             */
            goldChanged: "resource-manager-gold-changed",
        },
    },
    to: {
        uiScene: {
            /**
             * Arg: Class type of the sprite to be displayed in the target frame - @external Function
             */
            setTargetFrame: "ui-scene-set-target-frame",
            /**
             * Arg: The text to display - string
             * Arg: The duration of the alert in milliseconds (-1 for infinity) - number
             */
            showAlert: "game-scene-show-alert",
            /**
             * Arg: Text fields to be updated - @external TextFieldUpdate
             */
            updatePanelWaveInfo: "ui-scene-update-panel-wave-info",
        },
    },
};

export { gameEvents, eventKeys };

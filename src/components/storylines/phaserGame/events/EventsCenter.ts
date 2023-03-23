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
             * Arg: The duration of the alert in milliseconds (-1 for infinity) - number
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
        player: {
            pathChanged: "player-path-changed",
            pathFinalDestinationReached: "player-path-final-destination-reached",
        },
        enemy: {
            died: "enemy-died",
            finalDestinationReached: "enemy-final-destination-reached",
            /**
             * Arg: The object Enemy that is destroying the tower - @external Enemy
             * Arg: The tower tile position: @external Phaser.Math.Vector2
             */
            destroyTowerAt: "enemy-destroy-tower-at",
            /**
             * Arg: The object Enemy that is blocked - @external Enemy
             * Arg: The path of the Enemy before it was blocked, if any - Phaser.Math.Vector2 Array
             */
            pathBlocked: "sprite-path-blocked",
        },
        resourceManager: {
            noLivesRemaining: "resource-manager-no-lives-remaining",
        },
    },
};

export { gameEvents, eventKeys };

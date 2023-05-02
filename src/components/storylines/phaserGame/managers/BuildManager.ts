import { debugColors } from "../Colors";
import { eventKeys, gameEvents } from "../events/EventsCenter";
import { TowerType } from "../interfaces/Sprite.interfaces";
import { layerKeys } from "../Keys";
import CastleMap from "../maps/CastleMap";
import Player from "../sprites/Player";
import Tower from "../sprites/towers/Tower";
import TowerCrossbow from "../sprites/towers/TowerCrossbow";
import MathUtils from "../utils/Math.utils";

enum BuildModeStatus {
    On,
    Off,
    AwaitingPlayerToBuild,
}

interface BuildMode {
    status: BuildModeStatus;
    tower: Tower;
    targetTilePosition?: Phaser.Math.Vector2;
}

export default class BuildManager {
    #gameScene: Phaser.Scene;
    #castleMap: CastleMap;
    #player: Player;
    #towerGroupsByType: Map<TowerType, Phaser.GameObjects.Group> = new Map();
    #buildMode: BuildMode = { status: BuildModeStatus.Off, tower: null, targetTilePosition: null };

    constructor(gameScene: Phaser.Scene, castleMap: CastleMap, player: Player) {
        this.#gameScene = gameScene;
        this.#castleMap = castleMap;
        this.#player = player;

        this.#initEventHandlers();
        this.#createTowerGroups();
    }

    destroy() {
        for (const [_, towers] of this.#towerGroupsByType.entries()) {
            towers.destroy(true);
        }
    }

    isBuildModeOn() {
        return this.#buildMode.status === BuildModeStatus.On;
    }

    movePlayerToBuildTower(targetTilePosition: Phaser.Math.Vector2) {
        const layerTowerBuildable = this.#castleMap.getLayer(layerKeys.tower.buildable);
        if (!layerTowerBuildable.hasTileAt(targetTilePosition.x, targetTilePosition.y)) {
            return;
        }

        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        if (layerTowerBuilt.hasTileAt(targetTilePosition.x, targetTilePosition.y)) {
            return;
        }

        const playerWorldPosition = new Phaser.Math.Vector2(this.#player.x, this.#player.y);
        const layerPlayerGround = this.#castleMap.getLayer(layerKeys.ground.player);
        const playerTilePosition = layerPlayerGround.worldToTileXY(
            playerWorldPosition.x,
            playerWorldPosition.y
        );
        const isPlayerAlreadyAtTargetTilePosition =
            MathUtils.getDistanceBetween(playerTilePosition, targetTilePosition) === 0;

        if (isPlayerAlreadyAtTargetTilePosition) {
            this.#buildMode.targetTilePosition = targetTilePosition;
            this.#buildTower();
        } else {
            const playerLayers = this.#castleMap.getPlayerLayers();

            this.#buildMode.targetTilePosition = targetTilePosition;
            this.#buildMode.status = BuildModeStatus.AwaitingPlayerToBuild;
            this.#player.resetPath();
            this.#player.findPathAndMoveTo(targetTilePosition, {
                walkableLayer: playerLayers.walkable,
                unWalkableLayers: playerLayers.unWalkable,
                stopPathInFrontOfTarget: true,
            });
        }
    }

    updateTowerGhostPreview(worldPosition: Phaser.Math.Vector2) {
        const { tower } = this.#buildMode;
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        const layerTowerBuildable = this.#castleMap.getLayer(layerKeys.tower.buildable);
        const targetTilePosition = layerTowerBuildable.worldToTileXY(
            worldPosition.x,
            worldPosition.y
        );
        const targetTileWorldPosition = layerTowerBuildable.tileToWorldXY(
            targetTilePosition.x,
            targetTilePosition.y
        );
        const isHoveringABuildableTile = layerTowerBuildable.hasTileAt(
            targetTilePosition.x,
            targetTilePosition.y
        );
        const isHoveringABuiltTower = layerTowerBuilt.hasTileAt(
            targetTilePosition.x,
            targetTilePosition.y
        );

        if (isHoveringABuildableTile || isHoveringABuiltTower) {
            tower.setVisible(true);
            tower.setPosition(targetTileWorldPosition.x, targetTileWorldPosition.y);
        }

        if (isHoveringABuildableTile) {
            tower.clearTint();
        } else {
            tower.setVisible(false);
        }

        if (isHoveringABuiltTower) {
            tower.setTint(debugColors.red.hex);
        }
    }

    deactivateBuildMode(destroyTower = true) {
        const { tower } = this.#buildMode;

        if (destroyTower && tower) {
            this.#towerGroupsByType.get(tower.getTowerType()).remove(tower, true, true);
        }

        this.#buildMode = { status: BuildModeStatus.Off, tower: null, targetTilePosition: null };
    }

    #createTowerGroups() {
        const crossbowTowers = this.#gameScene.add.group({
            runChildUpdate: true,
            classType: TowerCrossbow,
        });
        this.#towerGroupsByType.set(TowerType.Crossbow, crossbowTowers);
    }

    #buildTower() {
        const { targetTilePosition, tower } = this.#buildMode;
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
        const tileTextureIndex = 17;

        const targetWorldPosition = layerTowerBuilt.tileToWorldXY(
            targetTilePosition.x,
            targetTilePosition.y
        );
        tower.startBuild(targetWorldPosition);
        layerTowerBuilt.putTileAt(tileTextureIndex, targetTilePosition.x, targetTilePosition.y);
        gameEvents.emit(eventKeys.from.gameScene.towerAdded, tower);
        this.deactivateBuildMode(false);
    }

    #destroyTowerAt(towerWorldPosition: Phaser.Math.Vector2) {
        for (const [, towerGroup] of this.#towerGroupsByType.entries()) {
            for (const gameObject of towerGroup.getChildren()) {
                const tower = gameObject as Tower;

                if (tower.x === towerWorldPosition.x && tower.y === towerWorldPosition.y) {
                    const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);
                    const towerTilePosition = layerTowerBuilt.worldToTileXY(tower.x, tower.y);

                    towerGroup.remove(tower, true, true);
                    layerTowerBuilt.removeTileAt(towerTilePosition.x, towerTilePosition.y);

                    return;
                }
            }
        }
    }

    #initEventHandlers() {
        gameEvents.on(
            eventKeys.from.uiScene.activateBuildMode,
            this.#handleActivateBuildMode,
            this
        );
        gameEvents.on(
            eventKeys.from.player.pathFinalDestinationReached,
            this.#handlePlayerPathFinalDestinationReached,
            this
        );
        gameEvents.on(eventKeys.from.player.pathChanged, this.#handlePlayerPathChanged, this);
        gameEvents.on(eventKeys.from.enemy.destroyTowerAt, this.#handleEnemyDestroyTowerAt, this);

        this.#gameScene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            gameEvents.off(eventKeys.from.uiScene.activateBuildMode);
            gameEvents.off(eventKeys.from.player.pathFinalDestinationReached);
            gameEvents.off(eventKeys.from.player.pathChanged);
            gameEvents.off(eventKeys.from.enemy.destroyTowerAt);
        });
    }

    #handleActivateBuildMode(towerType: TowerType) {
        if (this.#buildMode.status === BuildModeStatus.On) return;

        if (this.#buildMode.status === BuildModeStatus.AwaitingPlayerToBuild) {
            this.#player.resetPath();
            this.deactivateBuildMode();
        }

        const layerTowerBuildable = this.#castleMap.getLayer(layerKeys.tower.buildable);
        const pointerTilePosition = layerTowerBuildable.worldToTileXY(
            this.#gameScene.input.x,
            this.#gameScene.input.y
        );
        const pointerTileWorldPosition = layerTowerBuildable.tileToWorldXY(
            pointerTilePosition.x,
            pointerTilePosition.y
        );
        const towerGroup = this.#towerGroupsByType.get(towerType);
        const tower = (
            towerGroup.get(pointerTileWorldPosition.x, pointerTileWorldPosition.y) as Tower
        ).setAlpha(0.5);
        const newBuildMode: BuildMode = { status: BuildModeStatus.On, tower };

        this.#buildMode = newBuildMode;
        this.updateTowerGhostPreview(pointerTileWorldPosition);
    }

    #handlePlayerPathFinalDestinationReached() {
        if (this.#buildMode.status === BuildModeStatus.AwaitingPlayerToBuild) {
            this.#buildTower();
        }
    }

    #handlePlayerPathChanged() {
        if (this.#buildMode.status === BuildModeStatus.AwaitingPlayerToBuild) {
            this.deactivateBuildMode();
        }
    }

    #handleEnemyDestroyTowerAt(towerTilePosition: Phaser.Math.Vector2) {
        const layerTowerBuilt = this.#castleMap.getLayer(layerKeys.tower.built);

        if (layerTowerBuilt.hasTileAt(towerTilePosition.x, towerTilePosition.y)) {
            const towerWorldPosition = layerTowerBuilt.tileToWorldXY(
                towerTilePosition.x,
                towerTilePosition.y
            );
            this.#destroyTowerAt(towerWorldPosition);
        }
    }
}

import { Vector2d } from "../interfaces/Global.interfaces";
import { EnemyType } from "../interfaces/Sprite.interfaces";
import { layerKeys, textureKeys } from "../Keys";
import { Bandit } from "../sprites/enemies/Bandit";
import MathUtils from "../utils/Math.utils";
import GameUtils from "../utils/Game.utils";
import PathUtils from "../utils/Path.utils";
import { generateRandomId } from "../../../../utilities/Math.utils";
import Ui from "../scenes/Ui";
import CastleMap from "../maps/CastleMap";

interface Wave {
    id: string;
    index: number;
    name: string;
    number: number;
    enemyType: EnemyType;
    enemyCount: number;
    /**
     * Time delay between each spawn, in milliseconds.
     */
    enemySpawnDelay: number;
    /**
     * Time delay between each waves after the initial, in milliseconds.
     */
    startDelay: number;
}

interface EnemyWavesConfig {
    waves: Wave[];
}

enum WaveStatus {
    Ready,
    InProgress,
    Paused,
    Stopped,
    Ended,
}

interface WaveState extends Wave {
    status: WaveStatus;
    spawnedEnemyCount: number;
    remainingEnemyCount: number;
    spawnTimer: number;
    startTime: number;
    elapsedTime: number;
    endTime: number;
}

interface AllWavesState {
    startTime: number;
    elapsedTime: number;
    endTime: number;
}

const initialEnemyWavesConfig: EnemyWavesConfig = {
    waves: [
        {
            id: generateRandomId(),
            index: 0,
            name: "Bandit wave",
            number: 1,
            enemyCount: 2,
            enemyType: EnemyType.Bandit,
            enemySpawnDelay: MathUtils.secondsToMilliseconds(1),
            startDelay: MathUtils.secondsToMilliseconds(0),
        },
        {
            id: generateRandomId(),
            index: 1,
            name: "Wolf wave 1",
            number: 2,
            enemyCount: 4,
            enemyType: EnemyType.Wolf,
            enemySpawnDelay: MathUtils.secondsToMilliseconds(2),
            startDelay: MathUtils.secondsToMilliseconds(4),
        },
        {
            id: generateRandomId(),
            index: 2,
            name: "Wolf wave 2",
            number: 3,
            enemyCount: 8,
            enemyType: EnemyType.Wolf,
            enemySpawnDelay: MathUtils.secondsToMilliseconds(3),
            startDelay: MathUtils.secondsToMilliseconds(8),
        },
        {
            id: generateRandomId(),
            index: 3,
            name: "Wolf wave 3",
            number: 4,
            enemyCount: 10,
            enemyType: EnemyType.Wolf,
            enemySpawnDelay: MathUtils.secondsToMilliseconds(4),
            startDelay: MathUtils.secondsToMilliseconds(10),
        },
    ],
};

const initialAllWavesState: AllWavesState = {
    startTime: null,
    elapsedTime: null,
    endTime: null,
};

export default class EnemyWavesManager {
    #gameScene: Phaser.Scene;
    #uiScene: Ui;
    #castleMap: CastleMap;
    #enemyGroupsByType: Map<EnemyType, Phaser.Physics.Arcade.Group> = new Map();
    #enemyWavesConfig = initialEnemyWavesConfig;
    #lastTimeFromUpdateTick = -1;
    #allWavesState = initialAllWavesState;
    #waveState: WaveState;
    #completedWaves: WaveState[] = [];
    #remainingWaves: Map<string, WaveState> = new Map();
    #timer = 0;

    constructor(gameScene: Phaser.Scene, uiScene: Ui, castleMap: CastleMap) {
        this.#gameScene = gameScene;
        this.#uiScene = uiScene;
        this.#castleMap = castleMap;

        this.#initWaves();
        this.#startWaves();
    }

    update(time: number, delta: number) {
        this.#timer += delta;
        this.#lastTimeFromUpdateTick = time;
        this.#updateLogDebug(time, delta);

        const {
            status: waveStatus,
            enemyCount,
            spawnedEnemyCount,
            spawnTimer,
            enemySpawnDelay,
        } = this.#waveState;

        if (!this.#allWavesState.startTime || this.#allWavesState.endTime) return;
        if (waveStatus === WaveStatus.Stopped || waveStatus === WaveStatus.Paused) return;

        this.#allWavesState.elapsedTime = time - this.#allWavesState.startTime;

        switch (waveStatus) {
            case WaveStatus.Ready:
                {
                    const nextWaveConfig = this.#enemyWavesConfig.waves[this.#waveState.index];
                    const previousWaveState = this.#completedWaves[this.#waveState.index - 1];
                    const isFirstWave = this.#waveState.number === 1;
                    const isNextWaveReadyToStart =
                        nextWaveConfig.startDelay <= time - previousWaveState?.endTime;

                    if (isFirstWave || isNextWaveReadyToStart) {
                        this.#sendWave(time);
                    }
                }
                break;
            case WaveStatus.InProgress:
                {
                    this.#updateWaveState(time, delta);

                    const areAllEnemySpawned = spawnedEnemyCount === enemyCount;
                    const isNextEnemyReadyToSpawn = spawnTimer >= enemySpawnDelay;
                    if (!areAllEnemySpawned && isNextEnemyReadyToSpawn) {
                        this.#spawnEnemy();
                    }
                    if (areAllEnemySpawned) {
                        this.#endWave(time);
                    }
                }
                break;
        }

        this.#updateAllWavesState(time);
        this.#updateUi(time);
    }

    #updateLogDebug(time: number, delta: number) {
        this.#timer += delta;
        if (this.#timer > MathUtils.secondsToMilliseconds(10)) {
            this.#timer = 0;
            console.log("update - this.#waveState: ", this.#waveState);
            console.log("update - this.#allWavesState: ", this.#allWavesState);
        }
    }

    #initWaves() {
        for (let i = 0; i < this.#enemyWavesConfig.waves.length; i++) {
            const wave = this.#enemyWavesConfig.waves[i];

            const waveState: WaveState = {
                ...wave,
                status: WaveStatus.Ready,
                spawnedEnemyCount: 0,
                remainingEnemyCount: wave.enemyCount,
                spawnTimer: null,
                startTime: null,
                elapsedTime: null,
                endTime: null,
            };

            if (i === 0) {
                this.#waveState = waveState;
            }

            this.#remainingWaves.set(waveState.id, waveState);
        }

        console.log("#initWaves - this.#remainingWaves: ", this.#remainingWaves);
    }

    #startWaves() {
        this.#allWavesState.startTime = this.#lastTimeFromUpdateTick;
        console.log("#startWaves - this.#allWavesState: ", this.#allWavesState);
    }

    #sendWave(time: number) {
        this.#createEnemies();
        this.#spawnEnemy();

        const newWaveState: WaveState = {
            ...this.#waveState,
            startTime: time,
            status: WaveStatus.InProgress,
        };
        this.#waveState = newWaveState;
        console.log("#sendWave - this.#allWavesState: ", this.#allWavesState);
        console.log("#sendWave - this.#waveState: ", this.#waveState);
    }

    #endWave(time: number) {
        const currentWaveState: WaveState = {
            ...this.#waveState,
            endTime: time,
            status: WaveStatus.Ended,
        };

        this.#waveState = currentWaveState;
        this.#remainingWaves.delete(currentWaveState.id);
        this.#completedWaves.push(currentWaveState);

        const nextWave = this.#enemyWavesConfig.waves[currentWaveState.index + 1];
        if (nextWave) {
            this.#waveState = this.#remainingWaves.get(nextWave.id);
        } else {
            this.#allWavesState.endTime = time;
        }

        console.log("#sendWave - this.#allWavesState: ", this.#allWavesState);
        console.log("#endWave - this.#remainingWaves: ", this.#remainingWaves);
        console.log("#endWave - this.#completedWaves: ", this.#completedWaves);
    }

    #updateWaveState(time: number, delta: number) {
        const newWaveState: WaveState = {
            ...this.#waveState,
            elapsedTime: time - this.#waveState.startTime,
            spawnTimer: this.#waveState.spawnTimer + delta,
            // TODO update enemy count here?
        };
        this.#waveState = newWaveState;
    }

    #updateAllWavesState(time: number) {
        const newAllWavesState: AllWavesState = {
            ...this.#allWavesState,
            elapsedTime: time - this.#waveState.startTime,
        };
        this.#allWavesState = newAllWavesState;
    }

    #updateUi(time: number) {
        if (this.#timer >= MathUtils.secondsToMilliseconds(0.5)) {
            this.#timer = 0;

            this.#uiScene.setTextField(0, `Wave ${this.#waveState.number}`);
            this.#uiScene.setTextField(1, this.#waveState.name);

            const nextWave = this.#enemyWavesConfig.waves[this.#waveState.index + 1];
            const previousWaveState = this.#completedWaves[this.#waveState.index - 1];
            this.#uiScene.setTextField(2, "Enemy remaining");
            this.#uiScene.setTextField(3, this.#waveState.remainingEnemyCount.toString());
            this.#uiScene.setTextField(4, nextWave ? "Next wave" : "Final wave");
            this.#uiScene.setTextField(5, nextWave ? nextWave.name : "");
            this.#uiScene.setTextField(
                6,
                this.#waveState.status === WaveStatus.Ready ? "Next wave in" : ""
            );

            if (previousWaveState) {
                this.#uiScene.setTextField(
                    7,
                    this.#waveState.status === WaveStatus.Ready
                        ? `${Math.round(
                              MathUtils.millisecondsToSeconds(
                                  this.#waveState.startDelay - (time - previousWaveState.endTime)
                              )
                          )}s`
                        : ""
                );
            }
        }
    }

    #createEnemies() {
        const groupConfig: Phaser.Types.Physics.Arcade.PhysicsGroupConfig = {
            runChildUpdate: true,
        };

        const enemyType = this.#waveState.enemyType;
        switch (enemyType) {
            case EnemyType.Bandit:
                groupConfig.classType = Bandit;
                break;
            case EnemyType.Wolf:
                groupConfig.classType = Bandit;
                break;
            default:
                console.log(`#createEnemies - Invalid enemyType: ${enemyType}`);
                break;
        }

        const enemyGroup = this.#gameScene.physics.add.group(groupConfig);
        this.#enemyGroupsByType.set(enemyType, enemyGroup);
    }

    #spawnEnemy() {
        const startingTile: Vector2d = { x: 10, y: 0 };
        const layerGroundEnemy = this.#castleMap.getLayer(layerKeys.ground.enemy);
        const layerWallSide = this.#castleMap.getLayer(layerKeys.wall.side);
        const enemyStartingPosition = layerGroundEnemy.tileToWorldXY(
            startingTile.x,
            startingTile.y
        );
        enemyStartingPosition.x += layerGroundEnemy.tilemap.tileWidth / 2;
        enemyStartingPosition.y += layerGroundEnemy.tilemap.tileHeight / 2;

        const enemy = this.#enemyGroupsByType
            .get(EnemyType.Bandit)
            .get(enemyStartingPosition.x, enemyStartingPosition.y, textureKeys.sprites);

        const startTile = GameUtils.worldPositionToTileXY(enemy.x, enemy.y, layerGroundEnemy);
        const targetTilePosition = layerGroundEnemy.tileToWorldXY(10, 16);
        const targetTile = layerGroundEnemy.worldToTileXY(
            targetTilePosition.x,
            targetTilePosition.y
        );
        const path = PathUtils.findPath(startTile, targetTile, layerGroundEnemy, {
            unWalkableLayers: [layerWallSide],
        });

        enemy.moveAlong(path);

        const newWaveState: WaveState = {
            ...this.#waveState,
            spawnedEnemyCount: this.#waveState.spawnedEnemyCount + 1,
            spawnTimer: 0,
        };
        this.#waveState = newWaveState;
    }
}

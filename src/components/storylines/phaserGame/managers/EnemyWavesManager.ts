import { EnemyType } from "../interfaces/Sprite.interfaces";
import MathUtils from "../utils/Math.utils";
import { generateRandomId } from "../../../../utilities/Math.utils";
import { TextFieldUpdate } from "../scenes/Ui";
import { eventKeys, sceneEvents } from "../events/EventsCenter";

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
    Pending,
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

interface WavesState {
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
            enemyCount: 10,
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

const initialWavesState: WavesState = {
    startTime: null,
    elapsedTime: null,
    endTime: null,
};

export default class EnemyWavesManager {
    #enemyWavesConfig = initialEnemyWavesConfig;
    #lastTimeFromUpdateTick = -1;
    #wavesState = initialWavesState;
    #currentWaveState: WaveState;
    #completedWaves: WaveState[] = [];
    #remainingWaves: Map<string, WaveState> = new Map();
    #timer = 0;

    constructor() {
        this.#initWaves();
        this.startWaves();
    }

    update(time: number, delta: number) {
        this.#timer += delta;
        this.#lastTimeFromUpdateTick = time;
        this.#updateLogDebug(time, delta);

        const { status: waveStatus } = this.#currentWaveState;

        if (!this.#wavesState.startTime || this.#wavesState.endTime) return;
        if (waveStatus === WaveStatus.Stopped || waveStatus === WaveStatus.Paused) return;

        this.#wavesState.elapsedTime = time - this.#wavesState.startTime;

        switch (waveStatus) {
            case WaveStatus.Pending:
                this.#updatePendingWave(time);
                break;
            case WaveStatus.Ready:
                this.#sendWave(time);
                break;
            case WaveStatus.InProgress:
                this.#updateWaveInProgress(time, delta);
                break;
        }

        this.#updateAllWavesState(time);
        this.#updateUi(time);
    }

    #updateLogDebug(time: number, delta: number) {
        this.#timer += delta;
        if (this.#timer > MathUtils.secondsToMilliseconds(10)) {
            this.#timer = 0;
            // console.log("update - this.#waveState: ", this.#currentWaveState);
            // console.log("update - this.#allWavesState: ", this.#wavesState);
        }
    }

    #initWaves() {
        for (let i = 0; i < this.#enemyWavesConfig.waves.length; i++) {
            const wave = this.#enemyWavesConfig.waves[i];

            const waveState: WaveState = {
                ...wave,
                status: WaveStatus.Pending,
                spawnedEnemyCount: 0,
                remainingEnemyCount: wave.enemyCount,
                spawnTimer: null,
                startTime: null,
                elapsedTime: null,
                endTime: null,
            };

            if (i === 0) {
                this.#currentWaveState = waveState;
            }

            this.#remainingWaves.set(waveState.id, waveState);
        }

        // console.log("#initWaves - this.#remainingWaves: ", this.#remainingWaves);
    }

    startWaves() {
        this.#wavesState.startTime = this.#lastTimeFromUpdateTick;
        // console.log("#startWaves - this.#allWavesState: ", this.#wavesState);
    }

    endWave(time: number) {
        const currentWaveState: WaveState = {
            ...this.#currentWaveState,
            endTime: time,
            status: WaveStatus.Ended,
        };

        this.#currentWaveState = currentWaveState;
        this.#remainingWaves.delete(currentWaveState.id);
        this.#completedWaves.push(currentWaveState);

        const nextWave = this.#enemyWavesConfig.waves[currentWaveState.index + 1];
        if (nextWave) {
            this.#currentWaveState = this.#remainingWaves.get(nextWave.id);
        } else {
            this.#wavesState.endTime = time;
        }

        // console.log("#sendWave - this.#allWavesState: ", this.#wavesState);
        // console.log("#endWave - this.#remainingWaves: ", this.#remainingWaves);
        // console.log("#endWave - this.#completedWaves: ", this.#completedWaves);
    }

    #sendWave(time: number) {
        this.#spawnEnemy();

        const newWaveState: WaveState = {
            ...this.#currentWaveState,
            startTime: time,
            status: WaveStatus.InProgress,
        };
        this.#currentWaveState = newWaveState;
        // console.log("#sendWave - this.#allWavesState: ", this.#wavesState);
        // console.log("#sendWave - this.#waveState: ", this.#currentWaveState);
    }

    #updatePendingWave(time: number) {
        const currentWaveConfig = this.#enemyWavesConfig.waves[this.#currentWaveState.index];
        const previousWaveState = this.#completedWaves[this.#currentWaveState.index - 1];
        const isFirstWave = this.#currentWaveState.number === 1;
        const isWaveReady = currentWaveConfig.startDelay <= time - previousWaveState?.endTime;

        if (isFirstWave || isWaveReady) {
            const newWaveState: WaveState = {
                ...this.#currentWaveState,
                status: WaveStatus.Ready,
            };
            this.#currentWaveState = newWaveState;
        }
    }

    #updateWaveInProgress(time: number, delta: number) {
        const { enemyCount, spawnedEnemyCount, spawnTimer, enemySpawnDelay } =
            this.#currentWaveState;

        const newWaveState: WaveState = {
            ...this.#currentWaveState,
            elapsedTime: time - this.#currentWaveState.startTime,
            spawnTimer: this.#currentWaveState.spawnTimer + delta,
            // TODO update enemy count here?
        };
        this.#currentWaveState = newWaveState;

        const areAllEnemySpawned = spawnedEnemyCount === enemyCount;
        const isNextEnemyReadyToSpawn = spawnTimer >= enemySpawnDelay;
        if (!areAllEnemySpawned && isNextEnemyReadyToSpawn) {
            this.#spawnEnemy();
        }
        if (areAllEnemySpawned) {
            // TODO Remove, using for test purposes only
            this.endWave(time);
        }
    }

    #updateAllWavesState(time: number) {
        const newAllWavesState: WavesState = {
            ...this.#wavesState,
            elapsedTime: time - this.#currentWaveState.startTime,
        };
        this.#wavesState = newAllWavesState;
    }

    #updateUi(time: number) {
        if (this.#timer >= MathUtils.secondsToMilliseconds(0.5)) {
            this.#timer = 0;

            const nextWave = this.#enemyWavesConfig.waves[this.#currentWaveState.index + 1];
            const previousWaveState = this.#completedWaves[this.#currentWaveState.index - 1];
            const textFields: TextFieldUpdate[] = [
                { key: 0, text: `Wave ${this.#currentWaveState.number}` },
                { key: 1, text: this.#currentWaveState.name },
                { key: 2, text: "Enemy remaining" },
                { key: 3, text: this.#currentWaveState.remainingEnemyCount.toString() },
                { key: 4, text: nextWave ? "Next wave" : "Final wave" },
                { key: 5, text: nextWave ? nextWave.name : "" },
                {
                    key: 6,
                    text:
                        this.#currentWaveState.status === WaveStatus.Pending ? "Next wave in" : "",
                },
            ];

            if (previousWaveState && this.#currentWaveState.status === WaveStatus.Pending) {
                const timeUntilNextWave = `${Math.round(
                    MathUtils.millisecondsToSeconds(
                        this.#currentWaveState.startDelay - (time - previousWaveState.endTime)
                    )
                )}s`;

                textFields.push({
                    key: 7,
                    text: timeUntilNextWave,
                });
            } else {
                textFields.push({
                    key: 7,
                    text: "",
                });
            }

            sceneEvents.emit(eventKeys.uiScene.updatePanelInfo, textFields);
        }
    }

    #spawnEnemy() {
        sceneEvents.emit(eventKeys.gameScene.spawnEnemy);

        const newWaveState: WaveState = {
            ...this.#currentWaveState,
            spawnedEnemyCount: this.#currentWaveState.spawnedEnemyCount + 1,
            spawnTimer: 0,
        };
        this.#currentWaveState = newWaveState;
    }
}

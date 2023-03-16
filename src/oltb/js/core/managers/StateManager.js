import { Config } from "../Config";
import { LogManager } from './LogManager';

const FILENAME = 'managers/StateManager.js';

class StateManager {
    static #runtimeState;

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initializing started');
        this.#runtimeState = this.#loadBrowserData();
    }

    static setMap(map) { }

    static #loadBrowserData() {
        LogManager.logDebug(FILENAME, 'loadBrowserData', 'Loading stored state from browser');

        let state = {};

        try {
            state = JSON.parse(localStorage.getItem(Config.localStorage.key)) || {};
        }catch(error) {
            const errorMessage = 'Failed to load application state';
            LogManager.logError(FILENAME, 'loadBrowserData', {
                message: errorMessage,
                error: error
            });
        }

        LogManager.logDebug(FILENAME, 'loadBrowserData', structuredClone(state));

        return state;
    }

    static setStateObject(name, value) {
        this.#runtimeState[name] = value;
        this.saveState();
    }

    static getStateObject(name) {
        if(name in this.#runtimeState) {
            return this.#runtimeState[name];
        }
        
        return {};
    }

    static saveState() {
        try {
            const serialized = JSON.stringify(this.#runtimeState);
            localStorage.setItem(Config.localStorage.key, serialized);
        }catch(error) {
            const errorMessage = 'Failed to save application state';
            LogManager.logError(FILENAME, 'saveState', {
                message: errorMessage,
                error: error
            });
        }
    }

    static clear() {
        LogManager.logDebug(FILENAME, 'clear', 'Clearing stored state from browser');

        this.#runtimeState = {};
        localStorage.clear();
    }
}

export { StateManager };
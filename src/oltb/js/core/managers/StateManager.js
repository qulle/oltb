import { CONFIG } from "../Config";
import { LogManager } from './LogManager';

const FILENAME = 'managers/StateManager.js';

class StateManager {
    static #runtimeState = this.#loadBrowserState();

    static init(map) { }

    static #loadBrowserState() {
        LogManager.logDebug(FILENAME, 'loadBrowserState', 'Loading stored state from browser');

        let state = {};

        try {
            state = JSON.parse(localStorage.getItem(CONFIG.LocalStorage.Key)) || {};
        }catch(error) {
            const errorMessage = 'Failed to load application state';
            LogManager.logError(FILENAME, 'loadBrowserState', {
                message: errorMessage,
                error: error
            });
        }

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
            localStorage.setItem(CONFIG.LocalStorage.Key, serialized);
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
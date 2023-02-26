import { CONFIG } from "../Config";

const FILENAME = 'managers/StateManager.js';

class StateManager {
    static #runtimeState = JSON.parse(localStorage.getItem(CONFIG.LocalStorage.Key)) || {};

    static init(map) { }

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
        localStorage.setItem(CONFIG.LocalStorage.Key, JSON.stringify(this.#runtimeState));
    }

    static clear() {
        this.#runtimeState = {};
        localStorage.clear();
    }
}

export { StateManager };
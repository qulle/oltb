import CONFIG from "../Config";

class StateManager {
    static #runtimeState = JSON.parse(localStorage.getItem(CONFIG.localStorage.key)) || {};

    static init(map) { }

    static updateStateObject(name, value) {
        this.#runtimeState[name] = value;
        this.saveState();
    }

    static getStateObject(name) {
        if(name in this.#runtimeState) {
            return this.#runtimeState[name];
        }
        
        return null;
    }

    static saveState() {
        localStorage.setItem(CONFIG.localStorage.key, JSON.stringify(this.#runtimeState));
    }

    static clear() {
        this.#runtimeState = {};
        localStorage.clear();
    }
}

export default StateManager;
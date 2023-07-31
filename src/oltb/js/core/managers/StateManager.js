import _ from "lodash";
import { Config } from "../Config";
import { LogManager } from './LogManager';

const FILENAME = 'managers/StateManager.js';

// Some objects have properties that we don't want to store in localStorage
// Example: Bookmarks have a reference to the marker on the Map
const IgnoredKeys = Object.freeze([
    'marker'
]);

class StateManager {
    static #ignoredKeys;
    static #runtimeState;

    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');

        this.#ignoredKeys = this.#getIgnoredKeys(options);
        this.#runtimeState = this.#getBrowserData();
    }

    static setMap(map) { }

    static #getIgnoredKeys(options) {
        const ignoredKeys = Object.freeze([
            ...IgnoredKeys,
            ...options?.ignoredKeys || []
        ]);

        LogManager.logInformation(FILENAME, 'getIgnoredKeys', ignoredKeys);

        return ignoredKeys;
    }

    static #getBrowserData() {
        LogManager.logDebug(FILENAME, 'getBrowserData', 'Loading stored state from browser');

        let state = {};

        try {
            state = JSON.parse(localStorage.getItem(Config.localStorage.key)) || {};
        }catch(error) {
            LogManager.logError(FILENAME, 'getBrowserData', {
                message: 'Failed to load application state',
                error: error
            });
        }

        LogManager.logDebug(FILENAME, 'getBrowserData', _.cloneDeep(state));

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

    static getAndMergeStateObject(name, defaultObject) {
        return _.merge(_.cloneDeep(defaultObject), this.getStateObject(name));
    }

    static saveState() {
        try {
            const serialized = JSON.stringify(this.#runtimeState, (key, value) => {
                if(this.#ignoredKeys.includes(key)) {
                    return undefined;
                }

                return value;
            });
            localStorage.setItem(Config.localStorage.key, serialized);
        }catch(error) {
            LogManager.logError(FILENAME, 'saveState', {
                message: 'Failed to save application state',
                error: error
            });
        }
    }

    static clear() {
        LogManager.logDebug(FILENAME, 'clear', 'Clearing stored state from browser');

        this.#runtimeState = this.#getBrowserData();
    }
}

export { StateManager };
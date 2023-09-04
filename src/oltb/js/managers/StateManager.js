import _ from 'lodash';
import { Toast } from '../common/Toast';
import { LogManager } from './LogManager';
import { ConfigManager } from './ConfigManager';

const FILENAME = 'managers/StateManager.js';

// Note: Some objects have properties that we don't want to store in localStorage
// Example: Bookmarks have a reference to the marker on the Map
const IgnoredKeys = Object.freeze([
    'marker'
]);

/**
 * About:
 * StateManager
 * 
 * Description:
 * Manages the state that is stored in LocalStorage.
 * The state contains information about active tools, user selections, Map position and zoom etc.
 */
class StateManager {
    static #ignoredKeys;
    static #runtimeState;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#ignoredKeys = this.#getIgnoredKeys(options);
        this.#runtimeState = this.#getBrowserData();

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: Internal
    // -------------------------------------------------------------------

    static #getIgnoredKeys(options) {
        const ignoredKeys = Object.freeze([
            ...IgnoredKeys,
            ...options?.ignoredKeys || []
        ]);

        LogManager.logDebug(FILENAME, 'getIgnoredKeys', ignoredKeys);

        return ignoredKeys;
    }

    static #getBrowserData() {
        LogManager.logDebug(FILENAME, 'getBrowserData', 'Loading stored state from browser');

        let state = {};

        try {
            const key = ConfigManager.getConfig().localStorage.key;
            state = JSON.parse(localStorage.getItem(key)) || {};
        }catch(error) {
            LogManager.logError(FILENAME, 'getBrowserData', {
                message: 'Failed to load application state',
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: 'Failed to load application state'
            });
        }

        LogManager.logDebug(FILENAME, 'getBrowserData', _.cloneDeep(state));

        return state;
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

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

            const key = ConfigManager.getConfig().localStorage.key;
            localStorage.setItem(key, serialized);
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
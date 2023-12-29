import _ from 'lodash';
import { LogManager } from './LogManager';
import { DefaultConfig } from './config-manager/DefaultConfig';

const FILENAME = 'managers/ConfigManager.js';

const DefaultOptions = Object.freeze({
    url: '/assets/config/config.json'
});

/**
 * About:
 * ConfigManager
 * 
 * Description:
 * Manages loading of dynamic runtime JSON config that is merged with the DefaultConfig above.
 */
class ConfigManager {
    static #config;
    static #options;

    static async initAsync(options = {}) {
        this.#options = _.merge(_.cloneDeep(DefaultOptions), options);

        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        return this.#loadConfigFileAsync(this.#options.url);
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    static getConfig() {
        // Note: 
        // In some edge cases (LogManager as example)
        // The Config is required before it has loaded, return the DefaultConfig
        return this.#config || DefaultConfig;
    }

    static async #loadConfigFileAsync(url) {
        const timestamp = Date.now().toString();
        
        return fetch(`${url}?cache=${timestamp}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Accept': 'application/json'
            },
        }).then((response) => {
            if(!response.ok) {
                throw new Error('Bad response from server', {
                    cause: response
                });
            }

            return response.json();
        }).then((config) => {
            // Note: 
            // Use _.mergeWith and not _.merge to have merging of empty arrays behave as 'expected'
            // If a empty array is given in the custom config.json it will now replace the array in the default-object
            this.#config = _.mergeWith(_.cloneDeep(DefaultConfig), config, (a, b) => {
                if(_.isArray(b)) {
                    return b;
                }
                
                return undefined;
            });

            LogManager.logInformation(FILENAME, 'loadConfigFileAsync', _.cloneDeep(config));
            LogManager.logInformation(FILENAME, 'loadConfigFileAsync', _.cloneDeep(this.#config));

            return Promise.resolve({
                filename: FILENAME,
                result: true
            });
        }).catch((error) => {
            LogManager.logWarning(FILENAME, 'loadConfigFileAsync', {
                message: 'Failed to load configurations from /assets/config/config.json directory',
                error: error
            });

            return Promise.resolve({
                filename: FILENAME,
                result: false
            });
        });
    }
}

export { ConfigManager };
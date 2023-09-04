import _ from 'lodash';
import { LogManager } from './LogManager';
import { DefaultConfig } from './config-manager/DefaultConfig';

const FILENAME = 'managers/ConfigManager.js';

const DefaultOptions = Object.freeze({
    url: '/config.json'
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

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        options = _.merge(_.cloneDeep(DefaultOptions), options);

        return this.#loadConfigFileAsync(options.url);
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    static getConfig() {
        // Note: In some edge cases (LogManager as example)
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
            this.#config = _.merge(_.cloneDeep(DefaultConfig), config);

            LogManager.logDebug(FILENAME, 'loadConfigFileAsync', _.cloneDeep(this.#config));

            return Promise.resolve({
                filename: FILENAME,
                result: true
            });
        }).catch((error) => {
            LogManager.logWarning(FILENAME, 'loadConfigFileAsync', {
                message: 'No user config.json was found',
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
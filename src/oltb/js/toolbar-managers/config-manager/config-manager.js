import _ from 'lodash';
import axios from 'axios';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { DefaultConfig } from './default-config';

const FILENAME = 'config-manager.js';

const DefaultOptions = Object.freeze({
    url: './assets/config/config.json'
});

/**
 * About:
 * ConfigManager
 * 
 * Description:
 * Manages loading of dynamic runtime JSON config that is merged with the DefaultConfig above.
 */
class ConfigManager extends BaseManager {
    static #config;
    static #options;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
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
        return this.#config || _.cloneDeep(DefaultConfig);
    }

    static clearConfig() {
        this.#config = _.cloneDeep(DefaultConfig);
    }

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static async #loadConfigFileAsync(url) {
        const timestamp = Date.now().toString();
        
        return axios.get(url, {
            responseType: 'application/json',
            params: {
                cache: timestamp
            },
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        }).then((response) => {
            if(response.status !== 200) {
                throw new Error('Bad response from server', {
                    cause: response
                });
            }

            return JSON.parse(response.data);
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

            // Note:
            // First log the loaded config (the part that the user is overriding)
            // Second log the total runtime config result (default + user-overrided)
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
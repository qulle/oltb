import { LogManager } from "./LogManager";

const FILENAME = 'managers/TranslationManager.js';

/**
 * About:
 * TranslationManager
 * 
 * Description:
 * Manages loading and switching between different localizations.
 * The toolbar is shipped with two languages (English and Swedish).
 */
class TranslationManager {
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

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

    static getLanguages() {
        // TODO: Get from ConfigManager
        return Object.freeze([
            {
                text: 'Swedish (sv-se)',
                value: 'sv-se'
            }, {
                text: 'English (en-us)',
                value: 'en-us'
            }
        ]);
    }

    static getActive() {
        // TODO: Continue here
        return {
            text: 'English (en-us)',
            value: 'en-us'
        };
    }
}

export { TranslationManager };
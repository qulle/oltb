import moment from 'moment/moment';
import { ConfigManager } from './ConfigManager';

const FILENAME = 'managers/LogManager.js';

/**
 * About:
 * LogManager
 * 
 * Description:
 * Manages all Debug-, Information-, Warning-, Error- and Fatal log messages. 
 * Can handle both simple string messages and complex JSON objects.
 */
class LogManager {
    static #log = [];
    static #levels = Object.freeze({
        debug: {
            value: 1,
            icon: '👾',
            info: 'Debug',
            color: '#0166A5FF',
            backgroundColor: '#D7E3FA66',
            method: window.console.log
        },
        information: {
            value: 2,
            icon: '🐳',
            info: 'Information',
            color: '#3B4352FF',
            backgroundColor: '#D3D9E666',
            method: window.console.info
        },
        warning: {
            value: 3,
            icon: '🐠',
            info: 'Warning',
            color: '#FBBD02FF',
            backgroundColor: '#FFF1C566',
            method: window.console.warn
        },
        error: {
            value: 4,
            icon: '🐝',
            info: 'Error',
            color: '#EB4542FF',
            backgroundColor: '#FDB5B466',
            method: window.console.error
        },
        fatal: {
            value: 5,
            icon: '🐞',
            info: 'Fatal',
            color: '#493E9CFF',
            backgroundColor: '#D0CAFF66',
            method: window.console.error
        }
    });

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

    // -------------------------------------------------------------------
    // # Section: Internal
    // -------------------------------------------------------------------

    static #logSink(level, origin, method, value) {
        const timestamp = moment();
        const timeFormat = ConfigManager.getConfig().timeFormat;

        const entry = {
            timestamp: timestamp.format(timeFormat),
            level: level,
            origin: origin,
            method: method,
            value: value
        };

        this.#log.push(entry);

        return entry;
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static getLog() {
        return this.#log;
    }

    static clearLog() {
        this.#log = [];
    }

    static logDebug(origin, method, value) {
        return this.#logSink(this.#levels.debug, origin, method, value);
    }

    static logInformation(origin, method, value) {
        return this.#logSink(this.#levels.information, origin, method, value);
    }

    static logWarning(origin, method, value) {
        return this.#logSink(this.#levels.warning, origin, method, value);
    }

    static logError(origin, method, value) {
        return this.#logSink(this.#levels.error, origin, method, value);
    }

    static logFatal(origin, method, value) {
        return this.#logSink(this.#levels.fatal, origin, method, value);
    }
}

export { LogManager };
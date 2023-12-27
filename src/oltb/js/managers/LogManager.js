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
            color: '#00385B',
            backgroundColor: '#F0F6FF',
            method: window.console.debug
        },
        information: {
            value: 2,
            icon: '🐳',
            info: 'Information',
            color: '#1A1E24',
            backgroundColor: '#F3F4F5',
            method: window.console.info
        },
        warning: {
            value: 3,
            icon: '🐠',
            info: 'Warning',
            color: '#493B10',
            backgroundColor: '#FFF8E1',
            method: window.console.warn
        },
        error: {
            value: 4,
            icon: '🐝',
            info: 'Error',
            color: '#8D2120',
            backgroundColor: '#FFD5D4',
            method: window.console.error
        },
        fatal: {
            value: 5,
            icon: '🐞',
            info: 'Fatal',
            color: '#212529',
            backgroundColor: '#DFDBFF',
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

    static #logToConsole(level, origin, method, value, formattedTimestamp) {
        level.method(origin, method, value, formattedTimestamp);
    }

    static #logSink(level, origin, method, value) {
        const config = ConfigManager.getConfig();
        const timeFormat = config.timeFormat.pretty;
        const logToConsole = config.logging.logToConsole;

        const timestamp = moment();
        const formattedTimestamp = timestamp.format(timeFormat);

        const entry = {
            timestamp: formattedTimestamp,
            level: level,
            origin: origin,
            method: method,
            value: value
        };

        this.#log.push(entry);

        if(logToConsole) {
            this.#logToConsole(level, origin, method, value, formattedTimestamp);
        }

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
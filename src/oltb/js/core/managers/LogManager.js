const FILENAME = 'managers/LogManager.js';

class LogManager {
    static #log = [];
    static #levels = Object.freeze({
        debug: {
            level: 1,
            color: '#D7E3FA',
            consoleMethod: window.console.log
        },
        information: {
            level: 2,
            color: '#D3D9E6',
            consoleMethod: window.console.info
        },
        warning: {
            level: 3,
            color: '#FFF1C5',
            consoleMethod: window.console.warn
        },
        error: {
            level: 4,
            color: '#FDB5B4',
            consoleMethod: window.console.error
        }
    });

    static #logSink(level, origin, method, value) {
        // Store to show in debug tool
        this.#log.push({
            level: level,
            origin: origin,
            method: method,
            value: (typeof value === 'string' ? value : JSON.stringify(value, null, 4))
        });

        // Log to browser console
        level.consoleMethod.call(origin, method, value);
    }

    static init(map) { }

    static getLog() {
        return this.#log;
    }

    static clearLog() {
        this.#log = [];
    }

    static logDebug(origin, method, value) {
        this.#logSink(this.#levels.debug, origin, method, value);
    }

    static logInformation(origin, method, value) {
        this.#logSink(this.#levels.information, origin, method, value);
    }

    static logWarning(origin, method, value) {
        this.#logSink(this.#levels.warning, origin, method, value);
    }

    static logError(origin, method, value) {
        this.#logSink(this.#levels.error, origin, method, value);
    }
}

export { LogManager };
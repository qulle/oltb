import moment from "moment/moment";
import { Config } from "../Config";

const FILENAME = 'managers/LogManager.js';

class LogManager {
    static #isDebug;
    static #log = [];
    static #levels = Object.freeze({
        debug: {
            value: 1,
            icon: '🐳',
            info: 'Debug',
            color: '#D7E3FAFF',
            method: window.console.log
        },
        information: {
            value: 2,
            icon: '🐸',
            info: 'Information',
            color: '#D3D9E6FF',
            method: window.console.info
        },
        warning: {
            value: 3,
            icon: '🐠',
            info: 'Warning',
            color: '#FFF1C5FF',
            method: window.console.warn
        },
        error: {
            value: 4,
            icon: '🐝',
            info: 'Error',
            color: '#FDB5B4FF',
            method: window.console.error
        },
        fatal: {
            value: 5,
            icon: '🐞',
            info: 'Fatal',
            color: '#D0CAFFFF',
            method: window.console.error
        }
    });

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
    }

    static setMap(map) { }

    static #logSink(level, origin, method, value) {
        const timestamp = moment();
        const timeFormat = Config.timeFormat;

        this.#log.push({
            timestamp: timestamp.format(timeFormat),
            level: level,
            origin: origin,
            method: method,
            value: value
        });
    }

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

    static logFatal(origin, method, value) {
        this.#logSink(this.#levels.fatal, origin, method, value);
    }
}

export { LogManager };
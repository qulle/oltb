import moment from "moment/moment";
import { CONFIG } from "../Config";
import { UrlManager } from "./UrlManager";

const FILENAME = 'managers/LogManager.js';

class LogManager {
    static #isDebug;
    static #log = [];
    static #levels = Object.freeze({
        debug: {
            value: 1,
            icon: '🐳',
            info: 'Debug',
            color: '#D7E3FA',
            method: window.console.log
        },
        information: {
            value: 2,
            icon: '🐸',
            info: 'Information',
            color: '#D3D9E6',
            method: window.console.info
        },
        warning: {
            value: 3,
            icon: '🐠',
            info: 'Warning',
            color: '#FFF1C5',
            method: window.console.warn
        },
        error: {
            value: 4,
            icon: '🐝',
            info: 'Error',
            color: '#FDB5B4',
            method: window.console.error
        }
    });

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initializing started');
        
        this.#isDebug = UrlManager.getParameter('debug') === 'true';
    }

    static setMap(map) { }

    static #logSink(level, origin, method, value) {
        const timestamp = moment();
        const timeFormat = CONFIG.TimeFormat;

        // Store to show in debug tool
        this.#log.push({
            timestamp: timestamp.format(timeFormat),
            level: level,
            origin: origin,
            method: method,
            value: value
        });

        // Log to browser console if url has debug parameter
        if(Boolean(this.#isDebug)) {
            level.method.call(
                LogManager,
                level.icon, 
                timestamp.format(timeFormat), '🡒', origin, '🡒', method, '🡒', value
            );
        }
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
}

export { LogManager };
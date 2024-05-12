import { LogManager } from './LogManager';

const FILENAME = 'managers/UrlManager.js';

/**
 * About:
 * UrlManager
 * 
 * Description:
 * Manages and simplifies the usage of any GET-query parameter and the overall Location object.
 */
class UrlManager {
    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------

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
    
    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------

    static assign(path) {
        window.location.assign(path);
    }

    static replace(path) {
        window.location.replace(path);
    }

    static replaceParameter(parameters) {
        history.replaceState(null, null, `?${parameters.toString()}`);
    }

    static getParameters() {
        const uri = decodeURI(window.location.search);
        const urlParameters = new URLSearchParams(uri);

        return urlParameters;
    }

    static getParameter(name, isLowerCase = true) {
        const parameters = this.getParameters();
        const parameter = parameters.get(name) || '';

        if(isLowerCase) {
            return parameter.toLowerCase();
        }

        return parameter;
    }

    static setParameter(name, value) {
        const parameters = this.getParameters();
        parameters.set(name, value);

        this.replaceParameter(parameters);
    }

    static deleteParameter(name) {
        const parameters = this.getParameters();
        parameters.delete(name);

        this.replaceParameter(parameters);
    }
}

export { UrlManager };
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';

const FILENAME = 'url-manager.js';

/**
 * About:
 * UrlManager
 * 
 * Description:
 * Manages and simplifies the usage of any GET-query parameter and the overall Location object.
 */
class UrlManager extends BaseManager {
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
}

export { UrlManager };
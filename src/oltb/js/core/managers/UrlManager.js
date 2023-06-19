import { LogManager } from './LogManager';

const FILENAME = 'managers/UrlManager.js';

class UrlManager {
    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
    }

    static setMap(map) { }
    
    static assign(path) {
        window.location.assign(path);
    }

    static replaceParameter(parameters) {
        history.replaceState(null, null, `?${parameters.toString()}`);
    }

    static getParameters() {
        const uri = decodeURI(window.location.search);
        const urlParameters = new URLSearchParams(uri);

        return urlParameters;
    }

    static getParameter(name, lowerCase = true) {
        const parameters = this.getParameters();
        const parameter = parameters.get(name) || '';

        if(lowerCase) {
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
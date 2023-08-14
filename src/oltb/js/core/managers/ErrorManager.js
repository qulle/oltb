import { Toast } from '../../common/Toast';
import { LogManager } from "./LogManager";

const FILENAME = 'managers/ErrorManger.js';

/**
 * About:
 * ErrorManager
 * 
 * Description:
 * Manages all uncaught errors.
 */
class ErrorManager {
    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
        window.addEventListener('error', this.#onError);
    }

    static setMap(map) { }

    // -------------------------------------------------------------------
    // # Section: Events
    // -------------------------------------------------------------------

    static #onError(error) {
        error.preventDefault();

        // Note: If the error is thrown before the application has launched, the console is always available
        console.error(error);
        
        LogManager.logFatal(FILENAME, 'onError', {
            info: 'Global uncaught error',
            error: error.error
        });

        Toast.error({
            title: 'Error',
            message: 'An unexpected error occurred'
        });
    }
}

export { ErrorManager };
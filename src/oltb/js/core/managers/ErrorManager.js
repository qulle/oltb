import { Toast } from '../../common/Toast';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from './LogManager';

const FILENAME = 'managers/ErrorManger.js';

/**
 * About:
 * ErrorManager
 * 
 * Description:
 * Manages all uncaught errors.
 */
class ErrorManager {
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');
        
        window.addEventListener(Events.browser.error, this.#onError);

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
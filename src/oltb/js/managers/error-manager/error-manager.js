import { Toast } from '../../common/Toast';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from '../LogManager';

const FILENAME = 'managers/ErrorManger.js';
const I18N_BASE = 'managers.errorManager';

/**
 * About:
 * ErrorManager
 * 
 * Description:
 * Manages all uncaught errors.
 */
class ErrorManager {
    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    
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

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------

    static #onError(error) {
        error.preventDefault();

        // Note: 
        // If the error is thrown before the application has launched
        // The console is always available
        window.console.error(error);
        
        LogManager.logFatal(FILENAME, 'onError', {
            info: 'Global uncaught error',
            error: error.error
        });

        Toast.error({
            i18nKey: `${I18N_BASE}.toasts.errors.uncaughtException`
        });
    }
}

export { ErrorManager };
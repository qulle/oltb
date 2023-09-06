import { Toast } from '../common/Toast';
import { Events } from '../helpers/constants/Events';
import { LogManager } from './LogManager';
import { TranslationManager } from './TranslationManager';

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

        // Note: If the error is thrown before the application has launched
        // The console is always available
        console.error(error);
        
        LogManager.logFatal(FILENAME, 'onError', {
            info: 'Global uncaught error',
            error: error.error
        });

        const i18n = TranslationManager.get(`${I18N_BASE}.toasts.globalError`);
        Toast.error({
            title: i18n.title,
            message: i18n.message
        });
    }
}

export { ErrorManager };
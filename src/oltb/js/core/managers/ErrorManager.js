import { Toast } from '../../common/Toast';
import { LogManager } from "./LogManager";

const FILENAME = 'managers/ErrorManger.js';

class ErrorManager {
    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
        window.addEventListener('error', this.globalErrorHandler);
    }

    static setMap(map) { }

    static globalErrorHandler(error) {
        error.preventDefault();

        // Note: If the error is thrown before the application has launched, the console is always available
        console.error(error);
        
        LogManager.logFatal(FILENAME, 'globalErrorHandler', error.error);
        Toast.error({
            title: 'Error',
            message: 'An unexpected error occurred'
        });
    }
}

export { ErrorManager };
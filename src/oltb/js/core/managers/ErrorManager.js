import { Toast } from '../../common/Toast';
import { LogManager } from "./LogManager";

const FILENAME = 'managers/ErrorManger.js';

class ErrorManager {
    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');

        window.addEventListener('error', this.globalErrorHandler);
    }

    static setMap(map) { }

    static globalErrorHandler(error) {
        error.preventDefault();
        
        LogManager.logError(FILENAME, 'globalErrorHandler', error.error);
        Toast.error({
            title: 'Error',
            message: 'An unexpected error occurred'
        });
    }
}

export { ErrorManager };
import { LogManager } from '../../managers/LogManager';

const FILENAME = 'browser/CopyToClipboard.js';

const copyToClipboard = async function(text = '') {
    return window.navigator.clipboard.writeText(text.trim())
        .then(() => {
            return true;
        })
        .catch((error) => {
            LogManager.logError(FILENAME, 'copyToClipboard', {
                error: error
            });
            
            return false;
        });
}

export { copyToClipboard };
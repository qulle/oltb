import { LogManager } from "../../core/managers/LogManager";

const copyToClipboard = async function(text = '') {
    return navigator.clipboard.writeText(text.trim())
        .then(() => {
            return true;
        })
        .catch((error) => {
            LogManager.logError('CopyToClipboard.js', 'copyToClipboard', {
                message: 'Error copying data',
                error: error
            });
            return false;
        });
}

export { copyToClipboard };
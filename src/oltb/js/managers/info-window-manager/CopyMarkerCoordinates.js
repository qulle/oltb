import { Toast } from '../../common/Toast';
import { LogManager } from '../LogManager';
import { ConfigManager } from '../ConfigManager';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';

const FILENAME = 'info-window-manager/CopyMarkerCoordinates.js';

const copyMarkerCoordinates = async function(InfoWindowManager, data) {
    copyToClipboard(data)
        .then(() => {
            Toast.info({
                title: 'Copied',
                message: 'Marker coordinates copied to clipboard', 
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        })
        .catch((error) => {
            const errorMessage = 'Failed to copy marker coordinates';
            LogManager.logError(FILENAME, 'copyMarkerCoordinates', {
                message: errorMessage,
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        });
}

export { copyMarkerCoordinates };
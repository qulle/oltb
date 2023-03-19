import { Toast } from '../../../common/Toast';
import { Config } from '../../Config';
import { LogManager } from '../LogManager';
import { copyToClipboard } from '../../../helpers/browser/CopyToClipboard';

const FILENAME = 'info-window-manager/CopyMarkerCoordinates.js';

const copyMarkerCoordinates = async function(InfoWindowManager, data) {
    copyToClipboard(data)
        .then(() => {
            Toast.success({
                title: 'Copied',
                message: 'Marker coordinates copied to clipboard', 
                autoremove: Config.autoRemovalDuation.normal
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
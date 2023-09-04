import { Toast } from '../../common/Toast';
import { LogManager } from '../LogManager';
import { ConfigManager } from '../ConfigManager';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';

const FILENAME = 'info-window-manager/CopyMarkerInfo.js';

const copyMarkerInfo = async function(InfoWindowManager, dataToCopy) {
    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.info({
                title: 'Copied',
                message: 'Marker info copied to clipboard', 
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        })
        .catch((error) => {
            const errorMessage = 'Failed to copy marker info';
            LogManager.logError(FILENAME, 'copyMarkerInfo', {
                message: errorMessage,
                error: error
            });
            
            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        });
}

export { copyMarkerInfo };
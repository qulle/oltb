import { Toast } from '../../../common/Toast';
import { CONFIG } from '../../Config';
import { LogManager } from '../LogManager';
import { copyToClipboard } from '../../../helpers/browser/CopyToClipboard';

const FILENAME = 'info-window-manager/CopyMarkerInfo.js';

const copyMarkerInfo = async function(InfoWindowManager, dataToCopy) {
    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.success({
                title: 'Copied',
                message: 'Marker info copied to clipboard', 
                autoremove: CONFIG.AutoRemovalDuation.Normal
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
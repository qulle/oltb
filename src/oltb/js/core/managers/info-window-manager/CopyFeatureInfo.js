import { Toast } from '../../../common/Toast';
import { CONFIG } from '../../Config';
import { LogManager } from '../LogManager';
import { copyToClipboard } from '../../../helpers/browser/CopyToClipboard';

const copyFeatureInfo = async function(InfoWindowManager, dataToCopy) {
    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.success({
                title: 'Copied',
                message: 'Feature info copied to clipboard', 
                autoremove: CONFIG.AutoRemovalDuation.Normal
            });
        })
        .catch((error) => {
            const errorMessage = 'Failed to copy feature info';
            LogManager.logError('CopyFeatureInfo.js', 'copyFeatureInfo', {
                message: errorMessage,
                error: error
            });
            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        });
}

export { copyFeatureInfo };
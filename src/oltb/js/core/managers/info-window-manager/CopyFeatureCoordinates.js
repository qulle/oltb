import { Toast } from '../../../common/Toast';
import { CONFIG } from '../../Config';
import { LogManager } from '../LogManager';
import { copyToClipboard } from '../../../helpers/browser/CopyToClipboard';

const copyFeatureCoordinates = async function(InfoWindowManager, data) {
    copyToClipboard(data)
        .then(() => {
            Toast.success({
                title: 'Copied',
                message: 'Feature coordinates copied to clipboard', 
                autoremove: CONFIG.AutoRemovalDuation.Normal
            });
        })
        .catch((error) => {
            const errorMessage = 'Failed to copy feature coordinates';
            LogManager.logError('CopyFeatureCoordinages.js', 'copyFeatureCoordinates', {
                message: errorMessage,
                error: error
            });
            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        });
}

export { copyFeatureCoordinates };
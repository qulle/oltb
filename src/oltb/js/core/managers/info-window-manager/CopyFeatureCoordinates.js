import { Toast } from '../../../common/Toast';
import { CONFIG } from '../../Config';
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

            console.error(errorMessage, error);
            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        });
}

export { copyFeatureCoordinates };
import { Toast } from '../../../common/Toast';
import { CONFIG } from '../../Config';
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

            console.error(errorMessage, error);
            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        });
}

export { copyFeatureInfo };
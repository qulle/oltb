import { Toast } from '../../../common/Toast';
import { copyToClipboard } from '../../../helpers/browser/CopyToClipboard';

const copyFeatureInfo = async function(InfoWindowManager, dataToCopy) {
    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.success({
                title: 'Copied',
                message: 'Feature info copied to clipboard', 
                autoremove: 4000
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
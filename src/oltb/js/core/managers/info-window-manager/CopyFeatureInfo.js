import { Toast } from '../../../common/Toast';
import { copyToClipboard } from '../../../helpers/browser/CopyToClipboard';

const copyFeatureInfo = async function(InfoWindowManager, dataToCopy) {
    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.success({text: 'Data copied to clipboard', autoremove: 4000});
        })
        .catch((error) => {
            console.error('Error copying feature info', error);
            Toast.error({text: 'Failed to copy data'});
        });
}

export { copyFeatureInfo };
import Toast from '../../../common/Toast';
import { copyToClipboard } from '../../../helpers/Browser/CopyToClipboard';

const copyFeatureInfo = async function(dataToCopy) {
    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.success({text: 'Data copied to clipboard', autoremove: 4000});
        })
        .catch(() => {
            Toast.error({text: 'Failed to copy data'});
        });
}

export { copyFeatureInfo };
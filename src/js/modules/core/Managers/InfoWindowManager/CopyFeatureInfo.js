import Toast from '../../../common/Toast';
import { copyToClipboard } from '../../../helpers/CopyToClipboard';

const copyFeatureInfo = function(dataToCopy) {
    const copyStatus = copyToClipboard(dataToCopy);

    if(copyStatus) {
        Toast.success({text: 'Data copied to clipboard', autoremove: 3000});
    }else {
        Toast.error({text: 'Failed to copy data'});
    }
}

export { copyFeatureInfo };
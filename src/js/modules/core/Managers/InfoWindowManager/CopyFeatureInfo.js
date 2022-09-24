import Toast from '../../../common/Toast';
import { copyToClipboard } from '../../../helpers/Browser/CopyToClipboard';

const copyFeatureInfo = async function(dataToCopy) {
    const didCopy = await copyToClipboard(dataToCopy);

    if(didCopy) {
        Toast.success({text: 'Data copied to clipboard', autoremove: 4000});
    }else {
        Toast.error({text: 'Failed to copy data'});
    }
}

export { copyFeatureInfo };
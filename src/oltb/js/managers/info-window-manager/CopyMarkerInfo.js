import { Toast } from '../../common/Toast';
import { LogManager } from '../LogManager';
import { ConfigManager } from '../ConfigManager';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';
import { TranslationManager } from '../TranslationManager';

const FILENAME = 'info-window-manager/CopyMarkerInfo.js';
const I18N_BASE = 'managers.infoWindowManager';

const copyMarkerInfo = async function(InfoWindowManager, dataToCopy) {
    const i18n = TranslationManager.get(`${I18N_BASE}.toasts`);

    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.info({
                title: i18n.markerInfoCopied.title,
                message: i18n.markerInfoCopied.message, 
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        })
        .catch((error) => {
            LogManager.logError(FILENAME, 'copyMarkerInfo', {
                message: 'Failed to copy Marker info',
                error: error
            });
            
            Toast.error({
                title: i18n.markerInfoCopyError.title,
                message: i18n.markerInfoCopyError.message
            });
        });
}

export { copyMarkerInfo };
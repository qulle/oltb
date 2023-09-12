import { Toast } from '../../common/Toast';
import { LogManager } from '../LogManager';
import { ConfigManager } from '../ConfigManager';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';

const FILENAME = 'info-window-manager/CopyMarkerInfo.js';
const I18N_BASE = 'managers.infoWindowManager';

const copyMarkerInfo = async function(InfoWindowManager, dataToCopy) {
    copyToClipboard(dataToCopy)
        .then(() => {
            Toast.info({
                i18nKey: `${I18N_BASE}.toasts.infos.copyMarkerInfo`,
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        })
        .catch((error) => {
            LogManager.logError(FILENAME, 'copyMarkerInfo', {
                message: 'Failed to copy Marker info',
                error: error
            });
            
            Toast.error({
                i18nKey: `${I18N_BASE}.toasts.errors.copyMarkerInfo`
            });
        });
}

export { copyMarkerInfo };
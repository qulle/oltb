import { Toast } from '../../common/Toast';
import { LogManager } from '../LogManager';
import { ConfigManager } from '../ConfigManager';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';

const FILENAME = 'info-window-manager/CopyMarkerCoordinates.js';
const I18N_BASE = 'managers.infoWindowManager';

const copyMarkerCoordinates = async function(InfoWindowManager, data) {
    try {
        await copyToClipboard(data);

        Toast.info({
            i18nKey: `${I18N_BASE}.toasts.infos.copyMarkerCoordinates`,
            autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
        });
    }catch(error) {
        LogManager.logError(FILENAME, 'copyMarkerCoordinates', {
            message: 'Failed to copy Marker coordinates',
            error: error
        });
            
        Toast.error({
            i18nKey: `${I18N_BASE}.toasts.errors.copyMarkerCoordinates`,
        });
    }
}

export { copyMarkerCoordinates };
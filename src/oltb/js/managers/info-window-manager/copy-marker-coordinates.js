import { Toast } from '../../common/toasts/toast';
import { LogManager } from '../log-manager/log-manager';
import { ConfigManager } from '../config-manager/config-manager';
import { copyToClipboard } from '../../helpers/browser/copy-to-clipboard';

const FILENAME = 'CopyMarkerCoordinates.js';
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
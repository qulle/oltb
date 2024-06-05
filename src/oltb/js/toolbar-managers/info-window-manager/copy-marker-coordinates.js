import { Toast } from '../../ui-common/ui-toasts/toast';
import { LogManager } from '../log-manager/log-manager';
import { ConfigManager } from '../config-manager/config-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';

const FILENAME = 'copy-marker-coordinates.js';
const I18N__BASE = 'managers.infoWindowManager';

const copyMarkerCoordinates = async function(InfoWindowManager, data) {
    try {
        await copyToClipboard(data);

        Toast.info({
            i18nKey: `${I18N__BASE}.toasts.infos.copyMarkerCoordinates`,
            autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
        });
    }catch(error) {
        LogManager.logError(FILENAME, 'copyMarkerCoordinates', {
            message: 'Failed to copy Marker coordinates',
            error: error
        });
            
        Toast.error({
            i18nKey: `${I18N__BASE}.toasts.errors.copyMarkerCoordinates`,
        });
    }
}

export { copyMarkerCoordinates };
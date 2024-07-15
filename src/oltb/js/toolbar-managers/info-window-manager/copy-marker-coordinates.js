import { Toast } from '../../ui-common/ui-toasts/toast';
import { LogManager } from '../log-manager/log-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';

const FILENAME = 'copy-marker-coordinates.js';
const I18N__BASE = 'managers.infoWindowManager';

const copyMarkerCoordinatesAsync = async function(InfoWindowManager, data) {
    try {
        await copyToClipboard.copyAsync(data);

        Toast.info({
            i18nKey: `${I18N__BASE}.toasts.infos.copyMarkerCoordinates`,
            autoremove: true
        });
    }catch(error) {
        LogManager.logError(FILENAME, 'copyMarkerCoordinatesAsync', {
            message: 'Failed to copy Marker coordinates',
            error: error
        });
            
        Toast.error({
            i18nKey: `${I18N__BASE}.toasts.errors.copyMarkerCoordinates`,
        });
    }
}

export { copyMarkerCoordinatesAsync };
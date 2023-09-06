import { Toast } from '../../common/Toast';
import { LogManager } from '../LogManager';
import { ConfigManager } from '../ConfigManager';
import { copyToClipboard } from '../../helpers/browser/CopyToClipboard';
import { TranslationManager } from '../TranslationManager';

const FILENAME = 'info-window-manager/CopyMarkerCoordinates.js';
const I18N_BASE = 'managers.infoWindowManager';

const copyMarkerCoordinates = async function(InfoWindowManager, data) {
    const i18n = TranslationManager.get(`${I18N_BASE}.toasts`);

    copyToClipboard(data)
        .then(() => {
            Toast.info({
                title: i18n.markerCoordinatesCopied.title,
                message: i18n.markerCoordinatesCopied.message, 
                autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
            });
        })
        .catch((error) => {
            LogManager.logError(FILENAME, 'copyMarkerCoordinates', {
                message: 'Failed to copy Marker coordinates',
                error: error
            });
            
            Toast.error({
                title: i18n.markerCoordinatesCopyError.title,
                message: i18n.markerCoordinatesCopyError.message
            });
        });
}

export { copyMarkerCoordinates };
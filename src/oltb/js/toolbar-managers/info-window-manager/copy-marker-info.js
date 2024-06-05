import { Toast } from '../../ui-common/ui-toasts/toast';
import { LogManager } from '../log-manager/log-manager';
import { ConfigManager } from '../config-manager/config-manager';
import { copyToClipboard } from '../../browser-helpers/copy-to-clipboard';

const FILENAME = 'copy-marker-info.js';
const I18N__BASE = 'managers.infoWindowManager';

const copyMarkerInfo = async function(InfoWindowManager, data) {
    try {
        await copyToClipboard(data);

        Toast.info({
            i18nKey: `${I18N__BASE}.toasts.infos.copyMarkerInfo`,
            autoremove: ConfigManager.getConfig().autoRemovalDuation.normal
        });
    }catch(error) {
        LogManager.logError(FILENAME, 'copyMarkerInfo', {
            message: 'Failed to copy Marker info',
            error: error
        });
        
        Toast.error({
            i18nKey: `${I18N__BASE}.toasts.errors.copyMarkerInfo`
        });
    }
}

export { copyMarkerInfo };
import { Dialog } from '../../ui-common/ui-dialogs/dialog';
import { Events } from '../../browser-constants/events';
import { EventManager } from '../event-manager/event-manager';
import { LayerManager } from '../layer-manager/layer-manager';
import { TranslationManager } from '../translation-manager/translation-manager';

const I18N__BASE = 'managers.infoWindowManager';

const removeMarker = function(InfoWindowManager, marker) {
    const i18n = TranslationManager.get(`${I18N__BASE}.dialogs.confirms.deleteMarker`);

    return Dialog.confirm({
        title: i18n.title,
        message: i18n.message,
        confirmText: i18n.confirmText,
        cancelText: i18n.cancelText,
        onConfirm: () => {
            InfoWindowManager.hideOverlay();
            LayerManager.removeFeatureFromFeatureLayers(marker);
            
            // Note:
            // Important to use feature as property key, not only markers can be removed
            EventManager.dispatchCustomEvent([window], Events.custom.featureRemoved, {
                detail: {
                    feature: marker
                }
            });
        }
    });
}

export { removeMarker };
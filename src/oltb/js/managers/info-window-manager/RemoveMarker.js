import { Dialog } from '../../common/Dialog';
import { Events } from '../../helpers/constants/Events';
import { LayerManager } from '../LayerManager';
import { TranslationManager } from '../TranslationManager';

const I18N_BASE = 'managers.infoWindowManager';

const removeMarker = function(InfoWindowManager, marker) {
    const i18n = TranslationManager.get(`${I18N_BASE}.dialogs.confirms.deleteMarker`);

    Dialog.confirm({
        title: i18n.title,
        message: i18n.message,
        confirmText: i18n.confirmText,
        cancelText: i18n.cancelText,
        onConfirm: () => {
            this.hideOverlay();

            LayerManager.removeFeatureFromFeatureLayers(marker);
            
            // Note:
            // Important to use feature as property key
            // Not only markers can be removed
            window.dispatchEvent(new CustomEvent(Events.custom.featureRemoved, {
                detail: {
                    feature: marker
                }
            }));
        }
    });
}

export { removeMarker };
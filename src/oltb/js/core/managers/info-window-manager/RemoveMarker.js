import { Dialog } from '../../../common/Dialog';
import { EVENTS } from '../../../helpers/constants/Events';
import { LayerManager } from '../LayerManager';

const FILENAME = 'info-window-manager/RemoveMarker.js';

const removeMarker = function(InfoWindowManager, marker) {
    Dialog.confirm({
        title: 'Delete marker',
        message: 'Do you want to delete this marker?',
        confirmText: 'Delete',
        onConfirm: () => {
            this.hideOverlay();

            LayerManager.removeFeatureFromLayer(marker);
            
            // Important to use feature as property key
            // Not only markers can be removed
            window.dispatchEvent(new CustomEvent(EVENTS.Custom.FeatureRemoved, {
                detail: {
                    feature: marker
                }
            }));
        }
    });
}

export { removeMarker };
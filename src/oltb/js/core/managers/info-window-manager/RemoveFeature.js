import { Dialog } from '../../../common/Dialog';
import { EVENTS } from '../../../helpers/constants/Events';
import { LayerManager } from '../LayerManager';

const removeFeature = function(InfoWindowManager, feature) {
    Dialog.confirm({
        title: 'Delete marker',
        message: 'Do you want to delete this marker?',
        confirmText: 'Delete',
        onConfirm: () => {
            this.hideOverlay();

            LayerManager.removeFeatureFromLayer(feature);
            
            window.dispatchEvent(new CustomEvent(EVENTS.Custom.FeatureRemoved, {
                detail: {
                    feature: feature
                }
            }));
        }
    });
}

export { removeFeature };
import Dialog from '../../../common/Dialog';
import LayerManager from '../LayerManager';
import { EVENTS } from '../../../helpers/constants/Events';

const removeFeature = function(InfoWindowManager, feature) {
    Dialog.confirm({
        text: 'Do you want to delete this marker?',
        onConfirm: () => {
            LayerManager.removeFeatureFromLayer(feature);

            this.hideOverlay();

            // Dispatch event to trigger callback
            window.dispatchEvent(new CustomEvent(EVENTS.custom.featureRemoved, {
                detail: {
                    feature: feature
                }
            }));
        }
    });
}

export { removeFeature };
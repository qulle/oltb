import Dialog from '../../../common/Dialog';
import LayerManager from '../LayerManager';

const removeFeature = function(feature) {
    Dialog.confirm({
        text: 'Do you want to delete this marker?',
        onConfirm: () => {
            LayerManager.removeFeatureFromLayer(feature);

            this.hideOverlay();

            // Dispatch event to trigger callback
            window.dispatchEvent(new CustomEvent('oltb.feature.removed', {
                detail: {
                    feature: feature
                }
            }));
        }
    });
}

export { removeFeature };
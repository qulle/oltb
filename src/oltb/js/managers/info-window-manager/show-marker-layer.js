import { LogManager } from '../log-manager/log-manager';
import { LayerManager } from '../layer-manager/layer-manager';
import { ConfigManager } from '../config-manager/config-manager';

const FILENAME = 'ShowMarkerLayer.js';
const CLASS_TOOLBOX_INDICATE_ITEM = 'oltb-toolbox-list__item--indicate';

const showMarkerLayer = function(InfoWindowManager, marker) {
    const layerWrapper = LayerManager.getLayerWrapperFromFeature(marker);
    if(!layerWrapper) {
        LogManager.logWarning(FILENAME, 'showMarkerLayer', 'No layer found');

        return;
    }

    const layerElement = window.document.querySelector(`[data-oltb-id='${layerWrapper.getId()}']`);
    if(!layerElement) {
        LogManager.logWarning(FILENAME, 'showMarkerLayer', 'No layer-element found');

        return;
    }

    layerElement.classList.add(CLASS_TOOLBOX_INDICATE_ITEM);

    const timeout = ConfigManager.getConfig().animationDuration.slow;
    window.setTimeout(() => {
        layerElement.classList.remove(CLASS_TOOLBOX_INDICATE_ITEM);
    }, timeout);
}

export { showMarkerLayer };
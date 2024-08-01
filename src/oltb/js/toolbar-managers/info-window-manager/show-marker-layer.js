import { DOM } from '../../browser-helpers/dom-factory';
import { LogManager } from '../log-manager/log-manager';
import { LayerManager } from '../layer-manager/layer-manager';

const FILENAME = 'show-marker-layer.js';
const CLASS__TOOLBOX_INDICATE_ITEM = 'oltb-toolbox-list__item--indicate';

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

    DOM.flashClass(layerElement, CLASS__TOOLBOX_INDICATE_ITEM);
}

export { showMarkerLayer };
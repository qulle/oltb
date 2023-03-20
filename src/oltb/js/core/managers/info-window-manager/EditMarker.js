import { Config } from '../../Config';
import { Events } from '../../../helpers/constants/Events';
import { transform } from 'ol/proj';
import { MarkerModal } from "../../../tools/modal-extensions/MarkerModal";
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../LayerManager';
import { generateMarker } from '../../../generators/GenerateMarker';

const FILENAME = 'info-window-manager/EditMarker.js';
const ID_PREFIX = 'oltb-info-window-marker';

const editMarker = function(InfoWindowManager, beforeMarker) {
    const properties = beforeMarker.getProperties().oltb;
    const markerModal = new MarkerModal({
        edit: true,
        coordinates: transform(
            beforeMarker.getGeometry().getCoordinates(), 
            Config.projection.default, 
            Config.projection.wgs84
        ),
        title: properties.marker.title,
        description: properties.marker.description,
        fill: properties.style.fill,
        stroke: properties.style.stroke,
        icon: properties.marker.icon,
        onCreate: (result) => {
            onEditMarker(InfoWindowManager, beforeMarker, result);
        }
    });
}

const onEditMarker = function(InfoWindowManager, beforeMarker, result) {
    InfoWindowManager.hideOverlay();
    
    // Remove old marker and add new
    // Easier then updating the existing marker with new data.
    LayerManager.removeFeatureFromLayer(beforeMarker);

    const prettyCoordinates = toStringHDMS([result.longitude, result.latitude]);
    const infoWindow = {
        title: result.title,
        content: `
            <p>${result.description}</p>
        `,
        footer: `
            <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
            <div class="oltb-info-window__buttons-wrapper">
                <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                <button class="oltb-func-btn oltb-func-btn--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-text" data-copy="${result.title} ${result.description}"></button>
                <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="${ID_PREFIX}-edit"></button>
            </div>
        `
    };
    
    const afterMarker = new generateMarker({
        lon: result.longitude,
        lat: result.latitude,
        title: result.title,
        description: result.description,
        icon: result.icon,
        fill: result.fill,
        stroke: result.stroke,
        infoWindow: infoWindow
    });

    const layerWrapper = LayerManager.getActiveFeatureLayer({
        fallback: 'Markers'
    });
    
    layerWrapper.getLayer().getSource().addFeature(afterMarker);

    window.dispatchEvent(new CustomEvent(Events.custom.featureEdited, {
        detail: {
            before: beforeMarker,
            after: afterMarker
        }
    }));
}

export { editMarker };
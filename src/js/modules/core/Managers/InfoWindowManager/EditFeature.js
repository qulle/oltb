import CONFIG from '../../../core/Config';
import MarkerModal from "../../../tools/ModalExtensions/MarkerModal";
import InfoWindowManager from '../InfoWindowManager';
import LayerManager from '../LayerManager';
import { transform } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { generateMarker } from '../../../helpers/olFunctions/GenerateMarker';
import { SVG_PATHS, getIcon } from '../../Icons';
import { EVENTS } from '../../../helpers/Constants/Events';

const editFeature = function(feature) {
    const properties = feature.getProperties();

    const markerModal = new MarkerModal({
        edit: true,
        coordinates: transform(
            feature.getGeometry().getCoordinates(), 
            CONFIG.projection, 
            CONFIG.wgs84Projection
        ),
        name: properties.name,
        info: properties.info,
        backgroundColor: properties.backgroundColor,
        color: properties.color,
        icon: properties.icon
    }, function(result) {
        // Hide the current open overlay
        InfoWindowManager.hideOverlay();

        // Remove old marker and add new, easier then updating the existing marker with new data.
        LayerManager.removeFeatureFromLayer(feature);

        const prettyCoords = toStringHDMS([result.longitude, result.latitude]);
        const infoWindow = `
            <h3 class="oltb-text-center">${result.name}</h3>
            <p class="oltb-text-center">${result.info}</p>
            <p class="oltb-text-center">${prettyCoords}</p>
            <div class="oltb-d-flex oltb-justify-content-center">
                <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="oltb-info-window-remove-marker"></button>
                <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="oltb-info-window-copy-marker-location" data-copy="${result.name} ${result.info} Coordinates ${prettyCoords}"></button>
                <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="oltb-info-window-edit-marker"></button>
            </div>
        `;
        
        const icon = getIcon({
            path: SVG_PATHS[result.icon],
            width: 20,
            height: 20,
            fill: 'rgb(255, 255, 255)',
            stroke: 'none'
        });
        
        const marker = new generateMarker({
            name: result.name,
            info: result.info,
            lat: result.latitude,
            lon: result.longitude,
            iconName: result.icon,
            icon: icon,
            backgroundColor: result.backgroundColor,
            color: result.color,
            notSelectable: true,
            infoWindow: infoWindow
        });

        LayerManager.getActiveFeatureLayer({
            fallback: 'Markers'
        }).layer.getSource().addFeature(marker);

        // Dispatch event to trigger callback
        window.dispatchEvent(new CustomEvent(EVENTS.Custom.FeatureEdited, {
            detail: {
                feature: marker
            }
        }));
    });
}

export { editFeature };
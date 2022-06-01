import Config from '../../../core/Config';
import MarkerModal from "../../../tools/ModalExtensions/MarkerModal";
import InfoWindowManager from '../InfoWindowManager';
import LayerManager from '../LayerManager';
import { transform } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { generateMarker } from '../../../helpers/olFunctions/Marker';
import { SVGPaths, getIcon } from '../../Icons';

const editFeature = function(feature) {
    new MarkerModal({
        edit: true,
        coordinates: transform(
            feature.getGeometry().getCoordinates(), 
            Config.baseProjection, 
            Config.wgs84Projection
        ),
        name: feature.attributes.name,
        info: feature.attributes.info,
        backgroundColor: feature.attributes.backgroundColor,
        color: feature.attributes.color,
        icon: feature.attributes.icon
    }, function(response) {
        // Hide the current open overlay
        InfoWindowManager.hideOverlay();

        // Remove old marker and add new, easier then updating the existing marker with new data.
        LayerManager.removeFeatureFromLayer(feature);

        const prettyCoords = toStringHDMS([response.longitude, response.latitude]);
        const infoWindow = `
            <h3 class="oltb-text-center">${response.name}</h3>
            <p class="oltb-text-center">${response.info}</p>
            <p class="oltb-text-center">${prettyCoords}</p>
            <div class="oltb-d-flex oltb-justify-content-center">
                <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="oltb-info-window-remove-marker"></button>
                <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="oltb-info-window-copy-marker-location" data-copy="${response.name} ${response.info}"></button>
                <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="oltb-info-window-edit-marker"></button>
            </div>
        `;
        
        const marker = new generateMarker({
            name: response.name,
            info: response.info,
            lat: response.latitude,
            lon: response.longitude,
            iconName: response.icon,
            icon: getIcon({
                path: SVGPaths[response.icon],
                width: 20,
                height: 20,
                fill: 'rgb(255, 255, 255)',
                stroke: 'none'
            }),
            backgroundColor: response.backgroundColor,
            color: response.color,
            notSelectable: true,
            infoWindow: infoWindow
        });

        LayerManager.getActiveFeatureLayer({ifNoLayerName: 'Markers'}).layer.getSource().addFeatures(marker);

        // Dispatch event to trigger callback
        window.dispatchEvent(new CustomEvent('oltb.feature.edited', {
            detail: {
                feature: marker[0], 
                linkedFeature: marker[1]
            }
        }));
    });
}

export { editFeature };
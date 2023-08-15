import { Config } from '../../Config';
import { Events } from '../../../helpers/constants/Events';
import { transform } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../LayerManager';
import { IconMarkerModal } from "../../../tools/modal-extensions/IconMarkerModal";
import { generateIconMarker } from '../../../generators/GenerateIconMarker';

const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';

const editMarker = function(InfoWindowManager, beforeMarker) {
    const properties = beforeMarker.getProperties().oltb;
    new IconMarkerModal({
        edit: true,
        coordinates: transform(
            beforeMarker.getGeometry().getCoordinates(), 
            Config.projection.default, 
            Config.projection.wgs84
        ),
        title: properties.marker.title,
        description: properties.marker.description,
        icon: properties.marker.icon,
        markerFill: properties.style.markerFill,
        markerStroke: properties.style.markerStroke,
        label: properties.marker.label,
        labelFill: properties.style.labelFill,
        labelStrokeWidth: properties.style.labelStrokeWidth,
        labelStroke: properties.style.labelStroke,
        onCreate: (result) => {
            onEditMarker(InfoWindowManager, beforeMarker, result);
        }
    });
}

const addMarkerToMap = function(marker) {
    const layerWrapper = LayerManager.getActiveFeatureLayer({
        fallback: 'Markers'
    });
    
    layerWrapper.getLayer().getSource().addFeature(marker);
}

const onEditMarker = function(InfoWindowManager, beforeMarker, result) {
    InfoWindowManager.hideOverlay();
    
    // Remove old marker and add new
    // Easier then updating the existing marker with new data.
    LayerManager.removeFeatureFromFeatureLayers(beforeMarker);

    const coordinates = [result.longitude, result.latitude];
    const prettyCoordinates = toStringHDMS(coordinates);

    const infoWindow = {
        title: result.title,
        content: `
            <p>${result.description}</p>
        `,
        footer: `
            <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
            <div class="oltb-info-window__buttons-wrapper">
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" title="Delete Marker" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy Marker Coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy Marker Text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${result.title} ${result.description}"></button>
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy" title="Edit Marker" id="${ID_PREFIX_INFO_WINDOW}-edit"></button>
            </div>
        `
    };
    
    const afterMarker = new generateIconMarker({
        lon: coordinates[0],
        lat: coordinates[1],
        title: result.title,
        description: result.description,
        icon: result.icon,
        markerFill: result.fill,
        markerStroke: result.stroke,
        label: result.label,
        labelFill: result.labelFill,
        labelStrokeWidth: result.labelStrokeWidth,
        labelStroke: result.labelStroke,
        infoWindow: infoWindow
    });

    addMarkerToMap(afterMarker);

    window.dispatchEvent(new CustomEvent(Events.custom.featureEdited, {
        detail: {
            before: beforeMarker,
            after: afterMarker
        }
    }));
}

export { editMarker };
import { Events } from '../../helpers/constants/Events';
import { transform } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../LayerManager';
import { ConfigManager } from '../ConfigManager';
import { IconMarkerModal } from '../../tools/modal-extensions/IconMarkerModal';
import { TranslationManager } from '../TranslationManager';
import { generateIconMarker } from '../../generators/GenerateIconMarker';

const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const I18N_BASE_COMMON = 'commons';

const editMarker = function(InfoWindowManager, beforeMarker) {
    const properties = beforeMarker.getProperties().oltb;
    const projection = ConfigManager.getConfig().projection;

    new IconMarkerModal({
        edit: true,
        coordinates: transform(
            beforeMarker.getGeometry().getCoordinates(), 
            projection.default, 
            projection.wgs84
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
    
    // Note: Remove old marker and add new
    // Easier then updating the existing marker with new data.
    LayerManager.removeFeatureFromFeatureLayers(beforeMarker);

    const i18n = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);
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
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.delete" title="${i18n.delete}" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.copyCoordinates" title="${i18n.copyCoordinates}" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.copyText" title="${i18n.copyText}" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${result.title} ${result.description}"></button>
                <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.edit" title="${i18n.edit}" id="${ID_PREFIX_INFO_WINDOW}-edit"></button>
            </div>
        `
    };
    
    const afterMarker = new generateIconMarker({
        lon: coordinates[0],
        lat: coordinates[1],
        title: result.title,
        description: result.description,
        icon: result.icon,
        markerFill: result.markerFill,
        markerStroke: result.markerStroke,
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
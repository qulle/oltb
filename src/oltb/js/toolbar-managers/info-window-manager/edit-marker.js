import { Events } from '../../browser-constants/events';
import { transform } from 'ol/proj';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../layer-manager/layer-manager';
import { EventManager } from '../event-manager/event-manager';
import { ConfigManager } from '../config-manager/config-manager';
import { DefaultConfig } from '../config-manager/default-config';
import { FeatureManager } from '../feature-manager/feature-manager';
import { IconMarkerModal } from '../../ui-extensions/icon-marker-modal/icon-marker-modal';
import { TranslationManager } from '../translation-manager/translation-manager';

const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const I18N__BASE_COMMON = 'commons';

const editMarker = function(InfoWindowManager, beforeMarker) {
    const oltb = DefaultConfig.toolbar.id;
    const properties = beforeMarker.get(oltb);
    const projection = ConfigManager.getConfig().projection;

    return new IconMarkerModal({
        edit: true,
        coordinates: transform(
            beforeMarker.getGeometry().getCoordinates(), 
            projection.default, 
            projection.wgs84
        ),
        title: properties.title,
        description: properties.description,
        marker: {
            fill: properties.marker.fill,
            stroke: properties.marker.stroke,
        },
        icon: {
            key: properties.icon.key,
            fill: properties.icon.fill,
            stroke: properties.icon.stroke,
        },
        label: {
            text: properties.label.text,
            fill: properties.label.fill,
            stroke: properties.label.stroke,
            strokeWidth: properties.label.strokeWidth
        },
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
    
    // Note: 
    // Remove old marker and add new
    // Easier then updating the existing marker with new data.
    LayerManager.removeFeatureFromFeatureLayers(beforeMarker);

    const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
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
                <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--delete oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.delete" title="${i18n.delete}" id="${ID__PREFIX_INFO_WINDOW}-remove"></button>
                <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--crosshair oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.copyCoordinates" title="${i18n.copyCoordinates}" id="${ID__PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--copy oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.copyText" title="${i18n.copyText}" id="${ID__PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${result.title} ${result.description}"></button>
                <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--edit oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.edit" title="${i18n.edit}" id="${ID__PREFIX_INFO_WINDOW}-edit"></button>
                <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--layer oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.showLayer" title="${i18n.showLayer}" id="${ID__PREFIX_INFO_WINDOW}-show-layer"></button>
            </div>
        `
    };

    const afterMarker = FeatureManager.generateIconMarker({
        lon: coordinates[0],
        lat: coordinates[1],
        title: result.title,
        description: result.description,
        infoWindow: infoWindow,
        marker: {
            fill: result.markerFill,
            stroke: result.markerStroke
        },
        icon: {
            key: result.icon,
            fill: result.iconFill,
            stroke: result.iconStroke
        },
        label: {
            text: result.label,
            fill: result.labelFill,
            stroke: result.labelStroke,
            strokeWidth: result.labelStrokeWidth
        }
    });

    addMarkerToMap(afterMarker);
    
    EventManager.dispatchCustomEvent([window], Events.custom.featureEdited, {
        detail: {
            before: beforeMarker,
            after: afterMarker
        }
    });
}

export { editMarker };
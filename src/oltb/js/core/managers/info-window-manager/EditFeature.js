import { CONFIG } from '../../../core/Config';
import { EVENTS } from '../../../helpers/constants/Events';
import { transform } from 'ol/proj';
import { MarkerModal } from "../../../tools/modal-extensions/MarkerModal";
import { LayerManager } from '../LayerManager';
import { toStringHDMS } from 'ol/coordinate';
import { generateMarker } from '../../../generators/GenerateMarker';
import { SVG_PATHS, getIcon } from '../../icons/GetIcon';

const ID_PREFIX = 'oltb-info-window-marker';

const editFeature = function(InfoWindowManager, feature) {
    const properties = feature.getProperties().oltb;

    const markerModal = new MarkerModal({
        edit: true,
        coordinates: transform(
            feature.getGeometry().getCoordinates(), 
            CONFIG.Projection.Default, 
            CONFIG.Projection.WGS84
        ),
        name: properties.name,
        info: properties.info,
        backgroundColor: properties.backgroundColor,
        color: properties.color,
        icon: properties.icon,
        onCreate: (result) => {
            InfoWindowManager.hideOverlay();
    
            // Remove old marker and add new
            // Easier then updating the existing marker with new data.
            LayerManager.removeFeatureFromLayer(feature);
    
            const prettyCoordinates = toStringHDMS([result.longitude, result.latitude]);
            const infoWindow = {
                title: result.name,
                content: `
                    <p>${result.info}</p>
                `,
                footer: `
                    <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                    <div class="oltb-info-window__button-wrapper">
                        <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                        <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-location" data-copy="${result.name} ${result.info} Coordinates ${prettyCoordinates}"></button>
                        <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="${ID_PREFIX}-edit"></button>
                    </div>
                `
            };
            
            const [ iconName, iconVersion ] = result.icon.split('.');
            const icon = getIcon({
                path: SVG_PATHS[iconName][iconVersion],
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
    
            const layerWrapper = LayerManager.getActiveFeatureLayer({
                fallback: 'Markers'
            });
            
            layerWrapper.layer.getSource().addFeature(marker);
    
            window.dispatchEvent(new CustomEvent(EVENTS.Custom.FeatureEdited, {
                detail: {
                    before: feature,
                    after: marker
                }
            }));
        }
    });
}

export { editFeature };
import 'ol/ol.css';
import LayerManager from '../../core/Managers/LayerManager';
import MarkerModal from '../ModalExtensions/MarkerModal';
import { Control } from 'ol/control';
import { toolbarElement } from '../../core/ElementReferences';
import { generateMarker } from '../../helpers/Marker';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVGPaths, getIcon } from '../../core/Icons';
import { toStringHDMS } from 'ol/coordinate';

class HiddenMarker extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        const icon = getIcon({path: SVGPaths.Plus});

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Create marker', fn: function(map, coordinates, target) {
            new MarkerModal({coordinates: coordinates}, function(response) {
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

                // User defined callback from constructor
                if(typeof options.added === 'function') {
                    options.added(marker);
                }
            });
        }});

        addContextMenuItem('main.map.context.menu', {});

        window.addEventListener('oltb.feature.edited', function(event) {
            // User defined callback from constructor
            if(typeof options.edited === 'function') {
                options.edited([
                    event.detail.feature,
                    event.detail.linkedFeature
                ]);
            }
        });

        window.addEventListener('oltb.feature.removed', function(event) {
            // User defined callback from constructor
            if(typeof options.removed === 'function') {
                options.removed([
                    event.detail.feature,
                    event.detail.linkedFeature
                ]);
            }
        });
    }
}

export default HiddenMarker;
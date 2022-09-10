import 'ol/ol.css';
import LayerManager from '../../core/Managers/LayerManager';
import MarkerModal from '../ModalExtensions/MarkerModal';
import { Control } from 'ol/control';
import { toolbarElement } from '../../core/ElementReferences';
import { generateMarker } from '../../helpers/olFunctions/Marker';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVGPaths, getIcon } from '../../core/Icons';
import { toStringHDMS } from 'ol/coordinate';

const DEFAULT_OPTIONS = {};

class HiddenMarker extends Control {
    constructor(options = {}) {
        super({
            element: toolbarElement
        });

        this.options = { ...DEFAULT_OPTIONS, ...options };

        const icon = getIcon({path: SVGPaths.Plus});

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Create marker', fn: (map, coordinates, target) => {
            const markerModal = new MarkerModal({coordinates: coordinates}, (result) => {
                const prettyCoords = toStringHDMS([result.longitude, result.latitude]);
                const infoWindow = `
                    <h3 class="oltb-text-center">${result.name}</h3>
                    <p class="oltb-text-center">${result.info}</p>
                    <p class="oltb-text-center">${prettyCoords}</p>
                    <div class="oltb-d-flex oltb-justify-content-center">
                        <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="oltb-info-window-remove-marker"></button>
                        <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="oltb-info-window-copy-marker-location" data-copy="${result.name} ${result.info}"></button>
                        <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="oltb-info-window-edit-marker"></button>
                    </div>
                `;
                
                const marker = new generateMarker({
                    name: result.name,
                    info: result.info,
                    lat: result.latitude,
                    lon: result.longitude,
                    iconName: result.icon,
                    icon: getIcon({
                        path: SVGPaths[result.icon],
                        width: 20,
                        height: 20,
                        fill: 'rgb(255, 255, 255)',
                        stroke: 'none'
                    }),
                    backgroundColor: result.backgroundColor,
                    color: result.color,
                    notSelectable: true,
                    infoWindow: infoWindow
                });

                LayerManager.getActiveFeatureLayer({
                    ifNoLayerName: 'Markers'
                }).layer.getSource().addFeatures(marker);

                // User defined callback from constructor
                if(typeof this.options.added === 'function') {
                    this.options.added(marker);
                }
            });
        }});

        addContextMenuItem('main.map.context.menu', {});

        window.addEventListener('oltb.feature.edited', (event) => {
            // User defined callback from constructor
            if(typeof this.options.edited === 'function') {
                this.options.edited([
                    event.detail.feature,
                    event.detail.linkedFeature
                ]);
            }
        });
        window.addEventListener('oltb.feature.removed', (event) => {
            // User defined callback from constructor
            if(typeof this.options.removed === 'function') {
                this.options.removed([
                    event.detail.feature,
                    event.detail.linkedFeature
                ]);
            }
        });
    }
}

export default HiddenMarker;
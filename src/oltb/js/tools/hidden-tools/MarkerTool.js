import { EVENTS } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { ContextMenu } from '../../common/ContextMenu';
import { MarkerModal } from '../modal-extensions/MarkerModal';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../core/managers/LayerManager';
import { generateMarker } from '../../generators/GenerateMarker';
import { TOOLBAR_ELEMENT } from '../../core/elements/index';
import { SVG_PATHS, getIcon } from '../../core/icons/GetIcon';

const ID_PREFIX = 'oltb-info-window';
const DEFAULT_OPTIONS = Object.freeze({});

class HiddenMarkerTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        this.options = { ...DEFAULT_OPTIONS, ...options };

        const createIcon = getIcon({
            path: SVG_PATHS.PlusLarge.Stroked
        });

        ContextMenu.addItem({
            icon: createIcon, 
            name: 'Create marker', 
            fn: this.onContextMenuCreateMarker.bind(this)
        });
        
        ContextMenu.addItem({});

        window.addEventListener(EVENTS.Custom.FeatureEdited, this.onWindowFeatureEdited.bind(this));
        window.addEventListener(EVENTS.Custom.FeatureRemoved, this.onWindowFeatureRemoved.bind(this));
    }

    onContextMenuCreateMarker(map, coordinates, target) {
        const markerModal = new MarkerModal({
            coordinates: coordinates,
            onCreate: (result) => {
                const prettyCoordinates = toStringHDMS([result.longitude, result.latitude]);
                const infoWindow = {
                    title: result.name,
                    content: `
                        <p>${result.info}</p>
                    `,
                    footer: `
                        <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                        <div class="oltb-info-window__buttons-wrapper">
                            <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-marker-remove"></button>
                            <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-marker-copy-location" data-copy="${result.name} ${result.info} Coordinates ${prettyCoordinates}"></button>
                            <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="${ID_PREFIX}-marker-edit"></button>
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
    
                // User defined callback from constructor
                if(typeof this.options.added === 'function') {
                    this.options.added(marker);
                }
            }
        });
    }

    onWindowFeatureEdited(event) {
        // User defined callback from constructor
        if(typeof this.options.edited === 'function') {
            this.options.edited(
                event.detail.before, 
                event.detail.after
            );
        }
    }

    onWindowFeatureRemoved(event) {
        // User defined callback from constructor
        if(typeof this.options.removed === 'function') {
            this.options.removed(event.detail.feature);
        }
    }
}

export { HiddenMarkerTool };
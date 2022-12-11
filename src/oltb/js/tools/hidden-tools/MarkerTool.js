import MarkerModal from '../modal-extensions/MarkerModal';
import LayerManager from '../../core/managers/LayerManager';
import { EVENTS } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { toStringHDMS } from 'ol/coordinate';
import { CONTEXT_MENUS } from '../../helpers/constants/ContextMenus';
import { generateMarker } from '../../generators/GenerateMarker';
import { TOOLBAR_ELEMENT } from '../../core/elements/index';
import { addContextMenuItem } from '../../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../../core/icons/SVGIcons';

const ID_PREFIX = 'oltb-info-window';
const DEFAULT_OPTIONS = {};

class HiddenMarkerTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });

        this.options = { ...DEFAULT_OPTIONS, ...options };

        const createIcon = getIcon({
            path: SVG_PATHS.Plus
        });

        addContextMenuItem(CONTEXT_MENUS.MainMap, {
            icon: createIcon, 
            name: 'Create marker', 
            fn: this.onContextMenuCreateMarker.bind(this)
        });
        
        addContextMenuItem(CONTEXT_MENUS.MainMap, {});

        window.addEventListener(EVENTS.Custom.FeatureEdited, this.onWindowFeatureEdited.bind(this));
        window.addEventListener(EVENTS.Custom.FeatureRemoved, this.onWindowFeatureRemoved.bind(this));
    }

    onContextMenuCreateMarker(map, coordinates, target) {
        const markerModal = new MarkerModal({coordinates: coordinates}, (result) => {
            const prettyCoords = toStringHDMS([result.longitude, result.latitude]);
            const infoWindow = `
                <h3 class="oltb-text-center">${result.name}</h3>
                <p class="oltb-text-center">${result.info}</p>
                <p class="oltb-text-center">${prettyCoords}</p>
                <div class="oltb-d-flex oltb-justify-content-center">
                    <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-marker-remove"></button>
                    <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-marker-copy-location" data-copy="${result.name} ${result.info}"></button>
                    <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="${ID_PREFIX}-marker-edit"></button>
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

            const layerWrapper = LayerManager.getActiveFeatureLayer({
                fallback: 'Markers'
            });
            
            layerWrapper.layer.getSource().addFeature(marker);

            // Note: User defined callback from constructor
            if(typeof this.options.added === 'function') {
                this.options.added(marker);
            }
        });
    }

    onWindowFeatureEdited(event) {
        // Note: User defined callback from constructor
        if(typeof this.options.edited === 'function') {
            this.options.edited(
                event.detail.before, 
                event.detail.after
            );
        }
    }

    onWindowFeatureRemoved(event) {
        // Note: User defined callback from constructor
        if(typeof this.options.removed === 'function') {
            this.options.removed(event.detail.feature);
        }
    }
}

export default HiddenMarkerTool;
import { Events } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { ContextMenu } from '../../common/ContextMenu';
import { MarkerModal } from '../modal-extensions/MarkerModal';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../core/managers/LayerManager';
import { generateMarker } from '../../generators/GenerateMarker';
import { ElementManager } from '../../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../../core/icons/GetIcon';

const FILENAME = 'hidden-tools/HiddenMarkerTool.js';
const ID_PREFIX = 'oltb-info-window-marker';

const DefaultOptions = Object.freeze({
    added: undefined,
    removed: undefined,
    edited: undefined
});

class HiddenMarkerTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });

        this.options = { ...DefaultOptions, ...options };

        const createIcon = getIcon({
            path: SvgPaths.plusLarge.stroked
        });

        ContextMenu.addItem({
            icon: createIcon, 
            name: 'Create marker', 
            fn: this.onContextMenuCreateMarker.bind(this)
        });
        
        ContextMenu.addItem({});

        window.addEventListener(Events.custom.featureEdited, this.onWindowFeatureEdited.bind(this));
        window.addEventListener(Events.custom.featureRemoved, this.onWindowFeatureRemoved.bind(this));
    }

    onContextMenuCreateMarker(map, coordinates, target) {
        const markerModal = new MarkerModal({
            coordinates: coordinates,
            onCreate: (result) => {
                this.onCreateMarker(result);
            }
        });
    }

    onCreateMarker(result) {
        const coordinates = [
            Number(result.longitude),
            Number(result.latitude)
        ];

        const prettyCoordinates = toStringHDMS(coordinates);
        const infoWindow = {
            title: result.title,
            content: `
                <p>${result.description}</p>
            `,
            footer: `
                <span class="oltb-info-window__coordinates">${prettyCoordinates}</span>
                <div class="oltb-info-window__buttons-wrapper">
                    <button class="oltb-func-btn oltb-func-btn--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX}-remove"></button>
                    <button class="oltb-func-btn oltb-func-btn--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                    <button class="oltb-func-btn oltb-func-btn--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX}-copy-text" data-copy="${result.title}, ${result.description}"></button>
                    <button class="oltb-func-btn oltb-func-btn--edit oltb-tippy" title="Edit marker" id="${ID_PREFIX}-edit"></button>
                </div>
            `
        };
                
        const marker = new generateMarker({
            lon: result.longitude,
            lat: result.latitude,
            title: result.title,
            description: result.description,
            icon: result.icon,
            fill: result.fill,
            stroke: result.stroke,
            infoWindow: infoWindow
        });
    
        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: 'Markers'
        });
                
        layerWrapper.getLayer().getSource().addFeature(marker);
    
        // User defined callback from constructor
        if(typeof this.options.added === 'function') {
             this.options.added(marker);
        }
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
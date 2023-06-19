import { Events } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../../core/managers/LogManager';
import { ContextMenu } from '../../common/ContextMenu';
import { MarkerModal } from '../modal-extensions/MarkerModal';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../core/managers/LayerManager';
import { generateMarker } from '../../generators/GenerateMarker';
import { ElementManager } from '../../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../../core/icons/GetIcon';

const FILENAME = 'hidden-tools/HiddenMarkerTool.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const DefaultOptions = Object.freeze({
    added: undefined,
    removed: undefined,
    edited: undefined
});

class HiddenMarkerTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

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
        new MarkerModal({
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
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--delete oltb-tippy" title="Delete marker" id="${ID_PREFIX_INFO_WINDOW}-remove"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-copy="${result.title}, ${result.description}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy" title="Edit marker" id="${ID_PREFIX_INFO_WINDOW}-edit"></button>
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
        if(this.options.added instanceof Function) {
            this.options.added(marker);
        }
    }

    onWindowFeatureEdited(event) {
        // User defined callback from constructor
        if(this.options.edited instanceof Function) {
            this.options.edited(
                event.detail.before, 
                event.detail.after
            );
        }
    }

    onWindowFeatureRemoved(event) {
        // User defined callback from constructor
        if(this.options.removed instanceof Function) {
            this.options.removed(event.detail.feature);
        }
    }
}

export { HiddenMarkerTool };
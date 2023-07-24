import _ from 'lodash';
import { Events } from '../../helpers/constants/Events';
import { Control } from 'ol/control';
import { LogManager } from '../../core/managers/LogManager';
import { ContextMenu } from '../../common/ContextMenu';
import { MarkerModal } from '../modal-extensions/MarkerModal';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../core/managers/LayerManager';
import { ElementManager } from '../../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../../core/icons/GetIcon';
import { generateIconMarker } from '../../generators/GenerateIconMarker';

const FILENAME = 'hidden-tools/HiddenMarkerTool.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';

const DefaultOptions = Object.freeze({
    onAdded: undefined,
    onRemoved: undefined,
    onEdited: undefined
});

/**
 * About:
 * Create Markers in the Map
 * 
 * Description:
 * Create Markers with icons in the Map to visualize places, bookmarks, etc.
 */
class HiddenMarkerTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.createIcon = getIcon({
            path: SvgPaths.plusLarge.stroked
        });

        this.initContextMenuItems();

        window.addEventListener(Events.custom.featureEdited, this.onWindowFeatureEdited.bind(this));
        window.addEventListener(Events.custom.featureRemoved, this.onWindowFeatureRemoved.bind(this));
    }

    // -------------------------------------------------------------------
    // # Section: Init Helpers
    // -------------------------------------------------------------------

    initContextMenuItems() {
        ContextMenu.addItem({
            icon: this.createIcon, 
            name: 'Create Marker', 
            fn: this.onContextMenuCreateMarker.bind(this)
        });
        
        ContextMenu.addItem({});
    }

    // -------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    // -------------------------------------------------------------------

    onContextMenuCreateMarker(map, coordinates, target) {
        new MarkerModal({
            coordinates: coordinates,
            onCreate: (result) => {
                this.onCreateMarker(result);
            }
        });
    }

    // -------------------------------------------------------------------
    // # Section: Browser Events
    // -------------------------------------------------------------------

    onWindowFeatureEdited(event) {
        // Note: Consumer callback
        if(this.options.onEdited instanceof Function) {
            this.options.onEdited(
                event.detail.before, 
                event.detail.after
            );
        }
    }

    onWindowFeatureRemoved(event) {
        // Note: Consumer callback
        if(this.options.onRemoved instanceof Function) {
            this.options.onRemoved(event.detail.feature);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    // -------------------------------------------------------------------

    onCreateMarker(result) {
        this.addMarker(result);
    }

    // -------------------------------------------------------------------
    // # Section: Tool Actions
    // -------------------------------------------------------------------

    addMarker(result) {
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
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--crosshair oltb-tippy" title="Copy marker coordinates" id="${ID_PREFIX_INFO_WINDOW}-copy-coordinates" data-oltb-coordinates="${prettyCoordinates}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" title="Copy marker text" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${result.title}, ${result.description}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy" title="Edit marker" id="${ID_PREFIX_INFO_WINDOW}-edit"></button>
                </div>
            `
        };
        
        const marker = new generateIconMarker({
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

        // Note: Consumer callback
        if(this.options.onAdded instanceof Function) {
            this.options.onAdded(marker);
        }
    } 
}

export { HiddenMarkerTool };
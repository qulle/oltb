import _ from 'lodash';
import { Events } from '../../helpers/constants/events';
import { Control } from 'ol/control';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ContextMenu } from '../context-menu-tool/context-menu-tool';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../managers/layer-manager/layer-manager';
import { FeatureManager } from '../../managers/feature-manager/feature-manager';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { IconMarkerModal } from '../../modal-extensions/icon-marker-modal';
import { SvgPaths, getIcon } from '../../icons/get-icon';
import { TranslationManager } from '../../managers/translation-manager/translation-manager';

const FILENAME = 'HiddenMarkerTool.js';
const CLASS_FUNC_BUTTON = 'oltb-func-btn';
const ID_PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const I18N_BASE = 'tools.hiddenMarkerTool';
const I18N_BASE_COMMON = 'commons';

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
 * Create Markers with icons in the Map to visualize places, Bookmarks, etc.
 */
class HiddenMarkerTool extends Control {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super({
            element: ElementManager.getToolbarElement()
        });

        this.coordinatesModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.createIcon = getIcon({
            path: SvgPaths.plusLarge.stroked
        });

        this.initContextMenuItems();

        window.addEventListener(Events.custom.featureEdited, this.onWindowFeatureEdited.bind(this));
        window.addEventListener(Events.custom.featureRemoved, this.onWindowFeatureRemoved.bind(this));
    }

    getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    initContextMenuItems() {
        ContextMenu.addItem({
            icon: this.createIcon, 
            i18nKey: `${I18N_BASE}.contextItems.createMarker`, 
            fn: this.onContextMenuCreateMarker.bind(this)
        });
        
        ContextMenu.addItem({});
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    onContextMenuCreateMarker(map, coordinates, target) {
        this.doShowCoordinatesModal(coordinates);
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    onWindowFeatureEdited(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onEdited instanceof Function) {
            this.options.onEdited(event.detail.before, event.detail.after);
        }
    }

    onWindowFeatureRemoved(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onRemoved instanceof Function) {
            this.options.onRemoved(event.detail.feature);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    onCreateMarker(result) {
        this.doAddIconMarker(result);
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doShowCoordinatesModal(coordinates) {
        if(this.coordinatesModal) {
            return;
        }

        this.coordinatesModal = new IconMarkerModal({
            coordinates: coordinates,
            onCreate: (result) => {
                this.onCreateMarker(result);
            },
            onClose: () => {
                this.coordinatesModal = undefined;
            }
        });
    }

    doAddMarkerToMap(marker) {
        const layerWrapper = LayerManager.getActiveFeatureLayer({
            fallback: 'Markers'
        });
        
        layerWrapper.getLayer().getSource().addFeature(marker);
    }

    doAddIconMarker(result) {
        const coordinates = [
            Number(result.longitude),
            Number(result.latitude)
        ];

        const i18n = TranslationManager.get(`${I18N_BASE_COMMON}.titles`);
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
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--copy oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.copyText" title="${i18n.copyText}" id="${ID_PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${result.title}, ${result.description}"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--edit oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.edit" title="${i18n.edit}" id="${ID_PREFIX_INFO_WINDOW}-edit"></button>
                    <button class="${CLASS_FUNC_BUTTON} ${CLASS_FUNC_BUTTON}--layer oltb-tippy" data-oltb-i18n="${I18N_BASE_COMMON}.titles.showLayer" title="${i18n.showLayer}" id="${ID_PREFIX_INFO_WINDOW}-show-layer"></button>
                </div>
            `
        };

        const marker = FeatureManager.generateIconMarker({
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
    
        this.doAddMarkerToMap(marker);

        // Note: 
        // @Consumer callback
        if(this.options.onAdded instanceof Function) {
            this.options.onAdded(marker);
        }

        return marker;
    } 
}

export { HiddenMarkerTool };
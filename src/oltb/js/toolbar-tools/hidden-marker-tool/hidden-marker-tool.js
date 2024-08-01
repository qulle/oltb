import _ from 'lodash';
import { Events } from '../../browser-constants/events';
import { BaseTool } from '../base-tool';
import { toStringHDMS } from 'ol/coordinate';
import { LayerManager } from '../../toolbar-managers/layer-manager/layer-manager';
import { FeatureManager } from '../../toolbar-managers/feature-manager/feature-manager';
import { ContextMenuTool } from '../context-menu-tool/context-menu-tool';
import { IconMarkerModal } from '../../ui-extensions/icon-marker-modal/icon-marker-modal';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const FILENAME = 'hidden-marker-tool.js';
const CLASS__FUNC_BUTTON = 'oltb-func-btn';
const ID__PREFIX_INFO_WINDOW = 'oltb-info-window-marker';
const I18N__BASE = 'tools.hiddenMarkerTool';
const I18N__BASE_COMMON = 'commons';

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
class HiddenMarkerTool extends BaseTool {
    constructor(options = {}) {
        super({
            filename: FILENAME
        });

        this.iconMarkerModal = undefined;
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);

        this.createIcon = getSvgIcon({
            path: SvgPaths.plusLarge.stroked
        });

        this.#initContextMenuItems();
        this.attachGlobalListeners();
    }

    attachGlobalListeners() {
        this.onWindowFeatureEditedBind = this.#onWindowFeatureEdited.bind(this);
        this.onWindowFeatureRemovedBind = this.#onWindowFeatureRemoved.bind(this);

        window.addEventListener(Events.custom.featureEdited, this.onWindowFeatureEditedBind);
        window.addEventListener(Events.custom.featureRemoved, this.onWindowFeatureRemovedBind);
    }

    detachGlobalListeners() {
        window.removeEventListener(Events.custom.featureEdited, this.onWindowFeatureEditedBind);
        window.removeEventListener(Events.custom.featureRemoved, this.onWindowFeatureRemovedBind);
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: Init Helpers
    //--------------------------------------------------------------------
    #initContextMenuItems() {
        ContextMenuTool.addItem({
            icon: this.createIcon, 
            i18nKey: `${I18N__BASE}.contextItems.createMarker`, 
            fn: this.#onContextMenuCreateMarker.bind(this)
        });
        
        ContextMenuTool.addItem({});
    }

    //--------------------------------------------------------------------
    // # Section: ContextMenu Callbacks
    //--------------------------------------------------------------------
    #onContextMenuCreateMarker(map, coordinates, target) {
        this.doShowIconMarkerModal(coordinates);
    }

    //--------------------------------------------------------------------
    // # Section: Browser Events
    //--------------------------------------------------------------------
    #onWindowFeatureEdited(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onEdited) {
            this.options.onEdited(event.detail.before, event.detail.after);
        }
    }

    #onWindowFeatureRemoved(event) {
        // Note: 
        // @Consumer callback
        if(this.options.onRemoved) {
            this.options.onRemoved(event.detail.feature);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Map/UI Callbacks
    //--------------------------------------------------------------------
    #onCreateMarker(result) {
        this.doAddIconMarker(result);
    }

    //--------------------------------------------------------------------
    // # Section: Tool DoActions
    //--------------------------------------------------------------------
    doShowIconMarkerModal(coordinates) {
        if(this.iconMarkerModal) {
            return;
        }

        this.iconMarkerModal = new IconMarkerModal({
            coordinates: coordinates,
            onCreate: (result) => {
                this.#onCreateMarker(result);
            },
            onClose: () => {
                this.iconMarkerModal = undefined;
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

        const i18n = TranslationManager.get(`${I18N__BASE_COMMON}.titles`);
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
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--copy oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.copyText" title="${i18n.copyText}" id="${ID__PREFIX_INFO_WINDOW}-copy-text" data-oltb-copy="${result.title}, ${result.description}"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--edit oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.edit" title="${i18n.edit}" id="${ID__PREFIX_INFO_WINDOW}-edit"></button>
                    <button class="${CLASS__FUNC_BUTTON} ${CLASS__FUNC_BUTTON}--layer oltb-tippy" data-oltb-i18n="${I18N__BASE_COMMON}.titles.showLayer" title="${i18n.showLayer}" id="${ID__PREFIX_INFO_WINDOW}-show-layer"></button>
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
        if(this.options.onAdded) {
            this.options.onAdded(marker);
        }

        return marker;
    } 
}

export { HiddenMarkerTool };
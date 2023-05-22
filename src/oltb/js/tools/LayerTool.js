import tippy from 'tippy.js';
import { DOM } from '../helpers/browser/DOM';
import { Keys } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { Config } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { Events } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { download } from '../helpers/browser/Download';
import { LogManager } from '../core/managers/LogManager';
import { LayerModal } from './modal-extensions/LayerModal';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../core/managers/StateManager';
import { LayerManager } from '../core/managers/LayerManager';
import { ShortcutKeys } from '../helpers/constants/ShortcutKeys';
import { ElementManager } from '../core/managers/ElementManager';
import { instantiateLayer } from '../core/ol-types/LayerTypes';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { SvgPaths, getIcon } from '../core/icons/GetIcon';
import { instantiateSource } from '../core/ol-types/SourceTypes';
import { instantiateFormat } from '../core/ol-types/FormatTypes';
import { InfoWindowManager } from '../core/managers/InfoWindowManager';
import { ProjectionManager } from '../core/managers/ProjectionManager';
import { isShortcutKeyOnly } from '../helpers/browser/IsShortcutKeyOnly';
import { FeatureProperties } from '../helpers/constants/FeatureProperties';
import { DownloadLayerModal } from './modal-extensions/DownloadLayerModal';
import { hasCustomFeatureProperty } from '../helpers/browser/HasNestedProperty';

const FILENAME = 'tools/LayerTool.js';
const TOOL_BUTTON_CLASS = 'oltb-tool-button';
const TOOLBOX_SECTION_CLASS = 'oltb-toolbox-section';
const TOOLBOX_LIST_CLASS = 'oltb-toolbox-list';
const ID_PREFIX = 'oltb-layer';
const LAYER_BUTTON_DEFAULT_CLASSES = 'oltb-func-btn';

const DefaultOptions = Object.freeze({
    disableMapCreateLayerButton: false,
    disableMapLayerVisibilityButton: false,
    disableMapLayerEditButton: false,
    disableMapLayerDeleteButton: false,
    disableFeatureCreateLayerButton: false,
    disableFeatureLayerVisibilityButton: false,
    disableFeatureLayerEditButton: false,
    disableFeatureLayerDeleteButton: false,
    disableFeatureLayerDownloadButton: false,
    click: undefined,
    mapLayerAdded: undefined,
    mapLayerRemoved: undefined,
    mapLayerRenamed: undefined,
    mapLayerVisibilityChanged: undefined,
    featureLayerAdded: undefined,
    featureLayerRemoved: undefined,
    featureLayerRenamed: undefined,
    featureLayerVisibilityChanged: undefined,
    featureLayerDownloaded: undefined,
});

/* 
    Because this tool has two different sections that can be collapsed it's not a viable solution to have a single collapsed property. 
    Unfortunately this results in two longer names stored in localStorage.
*/
const LocalStorageNodeName = LocalStorageKeys.layerTool;
const LocalStorageDefaults = Object.freeze({
    active: false, 
    'oltb-layer-map-toolbox-collapsed': false,
    'oltb-layer-feature-toolbox-collapsed': false,
});

class LayerTool extends Control {
    constructor(options = {}) {
        super({
            element: ElementManager.getToolbarElement()
        });
        
        const icon = getIcon({
            path: SvgPaths.layers.stroked,
            class: `${TOOL_BUTTON_CLASS}__icon`
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: TOOL_BUTTON_CLASS,
            attributes: {
                type: 'button',
                'data-tippy-content': `Layers (${ShortcutKeys.layerTool})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        DOM.appendChildren(this.element, [
            button
        ]);

        this.button = button;
        this.active = false;
        this.options = { ...DefaultOptions, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        this.localStorage = { ...LocalStorageDefaults, ...localStorageState };

        const toolboxElement = ElementManager.getToolboxElement();
        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="${TOOLBOX_SECTION_CLASS}">
                <div class="${TOOLBOX_SECTION_CLASS}__header">
                    <h4 class="${TOOLBOX_SECTION_CLASS}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-map-toolbox-collapsed">
                        Map layers
                        <span class="${TOOLBOX_SECTION_CLASS}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${TOOLBOX_SECTION_CLASS}__groups" id="${ID_PREFIX}-map-toolbox-collapsed" style="display: ${this.localStorage[`${ID_PREFIX}-map-toolbox-collapsed`] ? 'none' : 'block'}">
                    ${
                        !this.options.disableMapCreateLayerButton ? 
                        `
                            <div class="${TOOLBOX_SECTION_CLASS}__group">
                                <button type="button" id="${ID_PREFIX}-map-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-w-100">Create map layer</button>
                            </div>
                        ` : ''
                    }
                    <div class="${TOOLBOX_SECTION_CLASS}__group ${this.options.disableMapCreateLayerButton ? `${TOOLBOX_SECTION_CLASS}__group--topmost` : ''} oltb-m-0">
                        <ul id="${ID_PREFIX}-map-stack" class="${TOOLBOX_LIST_CLASS}"></ul>
                    </div>
                </div>
                <div class="${TOOLBOX_SECTION_CLASS}__header">
                    <h4 class="${TOOLBOX_SECTION_CLASS}__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-feature-toolbox-collapsed">
                        Feature layers
                        <span class="${TOOLBOX_SECTION_CLASS}__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="${TOOLBOX_SECTION_CLASS}__groups" id="${ID_PREFIX}-feature-toolbox-collapsed" style="display: ${this.localStorage[`${ID_PREFIX}-feature-toolbox-collapsed`] ? 'none' : 'block'}">
                    <div class="${TOOLBOX_SECTION_CLASS}__group">
                        ${
                            !this.options.disableFeatureCreateLayerButton ? 
                            `
                                <div class="oltb-input-button-group">
                                    <input type="text" id="${ID_PREFIX}-feature-stack-add-text" class="oltb-input" placeholder="Layer name">
                                    <button type="button" id="${ID_PREFIX}-feature-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="Create feature layer">
                                        ${getIcon({
                                            path: SvgPaths.plus.stroked,
                                            width: 20,
                                            height: 20,
                                            fill: 'none',
                                            stroke: '#FFFFFFFF',
                                            class: 'oltb-btn__icon'
                                        })}
                                    </button>
                                </div>
                            ` : ''
                        }
                    </div>
                    <div class="${TOOLBOX_SECTION_CLASS}__group ${this.options.disableFeatureCreateLayerButton ? `${TOOLBOX_SECTION_CLASS}__group--topmost` : ''} oltb-m-0">
                        <ul id="${ID_PREFIX}-feature-stack" class="${TOOLBOX_LIST_CLASS} ${TOOLBOX_LIST_CLASS}--selectable"></ul>
                    </div>
                </div>
            </div>
        `);

        this.layersToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        const toggleableTriggers = this.layersToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(Events.browser.click, this.onToggleToolbox.bind(this, toggle));
        });

        this.mapLayerStack = this.layersToolbox.querySelector(`#${ID_PREFIX}-map-stack`);
        this.addMapLayerButton = this.layersToolbox.querySelector(`#${ID_PREFIX}-map-stack-add-button`);

        this.featureLayerStack = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack`);
        this.addFeatureLayerButton = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack-add-button`);
        this.addFeatureLayerText = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack-add-text`);

        if(Boolean(this.addMapLayerButton)) {
            this.addMapLayerButton.addEventListener(Events.browser.click, this.showAddMapLayerModal.bind(this));
        }

        if(Boolean(this.addFeatureLayerButton)) {
            this.addFeatureLayerButton.addEventListener(Events.browser.click, this.onFeatureLayerAdd.bind(this));
        }

        if(Boolean(this.addFeatureLayerText)) {
            this.addFeatureLayerText.addEventListener(Events.browser.keyUp, this.onFeatureLayerAdd.bind(this));
        }

        if(!Boolean(this.options.disableMapCreateLayerButton)) {
            ContextMenu.addItem({
                icon: icon, 
                name: 'Add map layer', 
                fn: this.onContextMenuAddMapLayerModal.bind(this)
            });
        }

        window.addEventListener(Events.custom.mapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(Events.custom.mapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(Events.custom.featureLayerAdded, this.onWindowFeatureLayerAdded.bind(this));
        window.addEventListener(Events.custom.featureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(Events.browser.contentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(Config.animationDuration.fast, (collapsed) => {
            this.localStorage[targetName] = collapsed;
            StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(Boolean(this.localStorage.active)) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, ShortcutKeys.layerTool)) {
            this.handleClick(event);
        }
    }

    onContextMenuAddMapLayerModal() {
        this.showAddMapLayerModal();
    }

    onFeatureLayerAdd(event) {
        if(
            event.type === Events.browser.keyUp && 
            event.key !== Keys.valueEnter
        ) {
            return;
        }

        LayerManager.addFeatureLayer(this.addFeatureLayerText.value);
        this.addFeatureLayerText.value = '';
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(this.options.click instanceof Function) {
            this.options.click();
        }
        
        if(Boolean(this.active)) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.active = true;
        this.layersToolbox.classList.add(`${TOOLBOX_SECTION_CLASS}--show`);
        this.button.classList.add(`${TOOL_BUTTON_CLASS}--active`);

        this.localStorage.active = true;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    deActivateTool() {
        this.active = false;
        this.layersToolbox.classList.remove(`${TOOLBOX_SECTION_CLASS}--show`);
        this.button.classList.remove(`${TOOL_BUTTON_CLASS}--active`);

        this.localStorage.active = false;
        StateManager.setStateObject(LocalStorageNodeName, this.localStorage);
    }

    showAddMapLayerModal() {
        const layerModal = new LayerModal({
            onCreate: (result) => {
                this.onCreateMapLayer(result);
            }
        });
    }

    onCreateMapLayer(result) {
        if(!ProjectionManager.hasProjection(result.projection)) {
            const errorMessage = `Must add projection definition for <strong>${result.projection}</strong>`;
            LogManager.logError(FILENAME, 'onCreateMapLayer', errorMessage);

            Toast.error({
                title: 'Error',
                message: `
                    ${errorMessage} <br>
                    <a href="https://epsg.io" target="_blank" class="oltb-link">https://epsg.io</a>
                `
            });

            return;
        }

        try {
            LayerManager.addMapLayer({
                name: result.name,
                layer: instantiateLayer(result.layer, {
                    projection: result.projection || Config.projection.default,
                    source: instantiateSource(result.source, {
                        url: result.url,
                        params: JSON.parse(result.parameters),
                        wrapX: result.wrapX,
                        attributions: result.attributions,
                        format: instantiateFormat(result.source)
                    })
                })
            });
        }catch(error) {
            const errorMessage = 'Failed to generate new layer';
            LogManager.logError(FILENAME, 'onCreateMapLayer', {
                message: errorMessage,
                error: error
            });

            Toast.error({
                title: 'Error',
                message: errorMessage
            });
        }
    }

    onWindowMapLayerAdded(event) {
        const layerWrapper = event.detail.layerWrapper;
        const silent = event.detail.silent;

        const disableVisibilityButton = this.options.disableMapLayerVisibilityButton;
        const disableEditButton = this.options.disableMapLayerEditButton;
        const disableDeleteButton = this.options.disableMapLayerDeleteButton;

        // Add to UI
        this.createLayerItem(layerWrapper, {
            idPrefix: `${ID_PREFIX}-map`,
            target: this.mapLayerStack,
            buttons: {
                ...(!disableVisibilityButton && {visibilityButton: {
                    function: this.createVisibilityButton, 
                    callback: this.options.mapLayerVisibilityChanged
                }}),
                ...(!disableEditButton && {editButton: {
                    function: this.createEditButton,
                    callback: this.options.mapLayerRenamed
                }}),
                ...(!disableDeleteButton && {deleteButton: {
                    function: this.createDeleteButton,
                    callback: LayerManager.removeMapLayer.bind(LayerManager)
                }})
            }
        });

        // User defined callback from constructor
        if(
            !Boolean(silent) &&
            this.options.mapLayerAdded instanceof Function
        ) {
            this.options.mapLayerAdded(layerWrapper);
        }
    }

    onWindowMapLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const layerWrapper = event.detail.layerWrapper;
        const silent = event.detail.silent;

        // Remove layer from UI
        this.mapLayerStack.querySelector(`#${ID_PREFIX}-map-${layerWrapper.getId()}`).remove();

        // User defined callback from constructor
        if(
            !Boolean(silent) &&
            this.options.mapLayerRemoved instanceof Function
        ) {
            this.options.mapLayerRemoved(layerWrapper);
        }
    }

    onWindowFeatureLayerAdded(event) {
        const layerWrapper = event.detail.layerWrapper;
        const silent = event.detail.silent;

        const disableVisibilityButton = this.options.disableFeatureLayerVisibilityButton;
        const disableEditButton = this.options.disableFeatureLayerEditButton;
        const disableDownloadButton = this.options.disableFeatureLayerDownloadButton;
        const disableDeleteButton = this.options.disableFeatureLayerDeleteButton;

        // Add to UI, this will check if the user has disabled any of the UI-buttons for a layer
        this.createLayerItem(layerWrapper, {
            idPrefix: `${ID_PREFIX}-feature`,
            target: this.featureLayerStack,
            buttons: {
                ...(!disableVisibilityButton && {visibilityButton: {
                    function: this.createVisibilityButton, 
                    callback: this.options.featureLayerVisibilityChanged
                }}),
                ...(!disableEditButton && {editButton: {
                    function: this.createEditButton,
                    callback: this.options.featureLayerRenamed
                }}),
                ...(!disableDownloadButton && {downloadButton: {
                    function: this.createDownloadButton,
                    callback: this.options.featureLayerDownloaded
                }}),
                ...(!disableDeleteButton && {deleteButton: {
                    function: this.createDeleteButton,
                    callback: LayerManager.removeFeatureLayer.bind(LayerManager)
                }})
            }
        });

        // User defined callback from constructor
        if(
            !Boolean(silent) &&
            this.options.featureLayerAdded instanceof Function
        ) {
            this.options.featureLayerAdded(layerWrapper);
        }
    }

    onWindowFeatureLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const layerWrapper = event.detail.layerWrapper;
        const silent = event.detail.silent;

        // Remove layer from UI
        this.featureLayerStack.querySelector(`#${ID_PREFIX}-feature-${layerWrapper.getId()}`).remove();

        // Set top-most-layer tas the active layer
        // Important that it is the first child, the LayerManager uses the first next layer
        const numLayers = this.featureLayerStack.querySelectorAll('li').length;
        if(numLayers > 0) {
            this.featureLayerStack.firstChild.classList.add(`${TOOLBOX_LIST_CLASS}__item--active`);
        }

        // User defined callback from constructor
        if(
            !Boolean(silent) &&
            this.options.featureLayerRemoved instanceof Function
        ) {
            this.options.featureLayerRemoved(layerWrapper);
        }
    }

    isFeatureLayer(options) {
        return options.idPrefix === `${ID_PREFIX}-feature`;
    }

    createLayerItem(layerWrapper, options) {
        // Should just be one li-item that has the active class, but just in case
        this.featureLayerStack.querySelectorAll('li').forEach((layer) => {
            layer.classList.remove(`${TOOLBOX_LIST_CLASS}__item--active`);
        });

        const layer = layerWrapper.getLayer();
        const layerElement = DOM.createElement({
            element: 'li', 
            id: `${options.idPrefix}-${layerWrapper.getId()}`,
            class: `${TOOLBOX_LIST_CLASS}__item ${TOOLBOX_LIST_CLASS}__item--active ${(
                !layer.getVisible() ? ` ${TOOLBOX_LIST_CLASS}__item--hidden` : ''
            )}`
        });

        // Eventlistener to update the UI if the visibility of the layer is changed
        // Other tools may change a layers visibility and the UI must be updated in this event
        layer.on(Events.openLayers.propertyChange, function(event) {
            if(event.key === 'visible') {
                layerElement.classList.toggle(`${TOOLBOX_LIST_CLASS}__item--hidden`);
            }
        });

        const layerName = DOM.createElement({
            element: 'span', 
            text: layerWrapper.getName().ellipsis(20),
            class: `${TOOLBOX_LIST_CLASS}__title`,
            title: layerWrapper.getName()
        });

        // This tooltip can not be triggered by the delegated .oltb-tippy class
        // Because the tooltip instance can not be reached in the renaming function unless it is known during "compile time"
        tippy(layerName, {
            content(reference) {
                const title = reference.getAttribute('title');
                reference.removeAttribute('title');
                return title;
            },
            placement: 'top',
            theme: 'oltb oltb-themed',
            delay: [600, 100]
        });

        // If feature layer - attach eventlistener for setting the active layer
        if(this.isFeatureLayer(options)) {
            layerName.addEventListener(Events.browser.click, (event) => {
                LayerManager.setActiveFeatureLayer(layerWrapper);
                // Should just be one li-item that has the active class, but just in case
                this.featureLayerStack.querySelectorAll('li').forEach((layer) => {
                    layer.classList.remove(`${TOOLBOX_LIST_CLASS}__item--active`)
                });
                    
                // Set the new layer as the active layer
                layerName.closest('li').classList.add(`${TOOLBOX_LIST_CLASS}__item--active`);
            });
        }

        const leftButtonWrapper = DOM.createElement({
            element: 'div',
            class: `${TOOLBOX_LIST_CLASS}__wrapper`
        });

        DOM.appendChildren(leftButtonWrapper, [
            layerName
        ]);

        DOM.appendChildren(layerElement, [
            leftButtonWrapper
        ]);

        const rightButtonWrapper = DOM.createElement({
            element: 'div',
            class: `${TOOLBOX_LIST_CLASS}__wrapper`
        });

        // Add all buttons to the layer
        for(const name in options.buttons) {
            const button = options.buttons[name].function.call(
                this,
                layerWrapper,
                options.buttons[name].callback,
                layerName
            );

            DOM.appendChildren(rightButtonWrapper, [
                button
            ]);
        }

        DOM.appendChildren(layerElement, [
            rightButtonWrapper
        ]);

        // Add the created layer item to the user interface
        options.target.prepend(layerElement);
    }

    createDeleteButton(layerWrapper, callback) {
        const deleteButton = DOM.createElement({
            element: 'button',
            class: `${LAYER_BUTTON_DEFAULT_CLASSES} oltb-func-btn--delete oltb-tippy`,
            title: 'Delete layer',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    Dialog.confirm({
                        title: 'Delete layer',
                        message: `Do you want to delete the <strong>${layerWrapper.getName()}</strong> layer?`,
                        confirmText: 'Delete',
                        onConfirm: function() {
                            callback(layerWrapper);
                        }
                    });
                }
            }
        });

        return deleteButton;
    }

    createDownloadButton(layerWrapper, callback) {
        const downloadButton = DOM.createElement({
            element: 'button', 
            class: `${LAYER_BUTTON_DEFAULT_CLASSES} oltb-func-btn--download oltb-tippy`,
            title: 'Download layer',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    const downloadModal = new DownloadLayerModal({
                        onDownload: (result) => {   
                            this.onDownloadLayer(layerWrapper, result);
                        }
                    });
                }
            }
        });

        return downloadButton;
    }

    onDownloadLayer(layerWrapper, result) {
        const format = instantiateFormat(result.format);
            
        if(!Boolean(format)) {
            const errorMessage = `Layer format '<strong>${result.format})</strong>' is not supported`;
            LogManager.logError(FILENAME, 'onDownloadLayer', errorMessage);

            Toast.error({
                title: 'Error',
                message: errorMessage
            });

            return;
        }

        LogManager.logDebug(FILENAME, 'onDownloadLayer', {
            layerName: layerWrapper.getName(),
            formatName: result.format,
            format: format
        });
            
        const features = layerWrapper.getLayer().getSource().getFeatures();
        const content = format.writeFeatures(features, {
            featureProjection: Config.projection.default
        });
                        
        const filename = `${layerWrapper.getName()}.${result.format.toLowerCase()}`;
        download(filename, content);
            
        // User defined callback from constructor
        if(callback instanceof Function) {
            callback(layerWrapper, filename, content);
        }
    }

    createEditButton(layerWrapper, callback, layerName) {
        const editButton = DOM.createElement({
            element: 'button',
            class: `${LAYER_BUTTON_DEFAULT_CLASSES} oltb-func-btn--edit oltb-tippy`,
            title: 'Rename layer',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    Dialog.prompt({
                        title: 'Edit name',
                        message: `You are editing the <strong>${layerWrapper.getName()}</strong> layer`,
                        value: layerWrapper.getName(),
                        confirmText: 'Rename',
                        onConfirm: function(result) {
                            if(result !== null && !!result.length) {
                                layerWrapper.setName(result);
                                layerName.innerText = result.ellipsis(20);
                                layerName._tippy.setContent(result);
                                
                                // User defined callback from constructor
                                if(callback instanceof Function) {
                                    callback(layerWrapper);
                                }
                            }
                        }
                    });
                }
            }
        });

        return editButton;
    }

    createVisibilityButton(layerWrapper, callback, layerName) {
        const map = this.getMap();
        if(!Boolean(map)) {
            return;
        }

        const visibilityButton = DOM.createElement({
            element: 'button',
            class: `${LAYER_BUTTON_DEFAULT_CLASSES} oltb-func-btn--visibility oltb-tippy`,
            title: 'Toggle visibility',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    InfoWindowManager.hideOverlay();

                    const layer = layerWrapper.getLayer();
                    const flippedVisibility = !layer.getVisible();
                    layer.setVisible(flippedVisibility);
                     
                    // Hide overlays associated with the layer
                    const hasFeatures = layer.getSource().getFeatures instanceof Function;
                    if(Boolean(hasFeatures)) {
                        layer.getSource().getFeatures().forEach((feature) => {
                            if(hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip)) {
                                feature.getProperties().oltb.tooltip.setMap(flippedVisibility ? map : null)
                            }
                        });
                    }

                    // User defined callback from constructor
                    if(callback instanceof Function) {
                        callback(layerWrapper);
                    }
                }
            }
        });

        return visibilityButton;
    }
}

export { LayerTool };
import tippy from 'tippy.js';
import { DOM } from '../helpers/browser/DOM';
import { KEYS } from '../helpers/constants/Keys';
import { Toast } from '../common/Toast';
import { CONFIG } from '../core/Config';
import { Dialog } from '../common/Dialog';
import { EVENTS } from '../helpers/constants/Events';
import { Control } from 'ol/control';
import { download } from '../helpers/browser/Download';
import { LogManager } from '../core/managers/LogManager';
import { LayerModal } from './modal-extensions/LayerModal';
import { ContextMenu } from '../common/ContextMenu';
import { StateManager } from '../core/managers/StateManager';
import { LayerManager } from '../core/managers/LayerManager';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { instantiateLayer } from '../core/ol-types/LayerTypes';
import { InfoWindowManager } from '../core/managers/InfoWindowManager';
import { instantiateSource } from '../core/ol-types/SourceTypes';
import { instantiateFormat } from '../core/ol-types/FormatTypes';
import { isShortcutKeyOnly } from '../helpers/browser/ShortcutKeyOnly';
import { SVG_PATHS, getIcon } from '../core/icons/GetIcon';
import { LOCAL_STORAGE_KEYS } from '../helpers/constants/LocalStorageKeys';
import { DownloadLayerModal } from './modal-extensions/DownloadLayerModal';
import { FEATURE_PROPERTIES } from '../helpers/constants/FeatureProperties';
import { hasCustomFeatureProperty } from '../helpers/browser/HasNestedProperty';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/elements/index';

const FILENAME = 'tools/LayerTool.js';
const LAYER_BUTTON_DEFAULT_CLASSES = 'oltb-func-btn';
const ID_PREFIX = 'oltb-layer';

const DEFAULT_OPTIONS = Object.freeze({
    disableMapCreateLayerButton: false,
    disableMapLayerVisibilityButton: false,
    disableMapLayerEditButton: false,
    disableMapLayerDeleteButton: false,
    disableFeatureCreateLayerButton: false,
    disableFeatureLayerVisibilityButton: false,
    disableFeatureLayerEditButton: false,
    disableFeatureLayerDeleteButton: false,
    disableFeatureLayerDownloadButton: false
});

/* 
    Because this tool has two different sections that can be collapsed it's not a viable solution to have a single collapsed property. 
    Unfortunately this results in two longer names stored in localStorage.
*/
const LOCAL_STORAGE_NODE_NAME = LOCAL_STORAGE_KEYS.LayerTool;
const LOCAL_STORAGE_DEFAULTS = Object.freeze({
    active: false, 
    'oltb-layer-map-toolbox-collapsed': false,
    'oltb-layer-feature-toolbox-collapsed': false,
});

class LayerTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Layers.Stroked,
            class: 'oltb-tool-button__icon'
        });

        const button = DOM.createElement({
            element: 'button',
            html: icon,
            class: 'oltb-tool-button',
            attributes: {
                type: 'button',
                'data-tippy-content': `Layers (${SHORTCUT_KEYS.Layer})`
            },
            listeners: {
                'click': this.handleClick.bind(this)
            }
        });

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // Load stored data from localStorage
        const localStorageState = StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME);
        this.localStorage = { ...LOCAL_STORAGE_DEFAULTS, ...localStorageState };

        TOOLBOX_ELEMENT.insertAdjacentHTML('beforeend', `
            <div id="${ID_PREFIX}-toolbox" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-map-toolbox-collapsed">
                        Map layers
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-map-toolbox-collapsed" style="display: ${this.localStorage[`${ID_PREFIX}-map-toolbox-collapsed`] ? 'none' : 'block'}">
                    ${
                        !this.options.disableMapCreateLayerButton ? 
                        `
                            <div class="oltb-toolbox-section__group">
                                <button type="button" id="${ID_PREFIX}-map-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-w-100">Create map layer</button>
                            </div>
                        ` : ''
                    }
                    <div class="oltb-toolbox-section__group ${this.options.disableMapCreateLayerButton ? 'oltb-toolbox-section__group--topmost' : ''} oltb-m-0">
                        <ul id="${ID_PREFIX}-map-stack" class="oltb-toolbox-list"></ul>
                    </div>
                </div>
                <div class="oltb-toolbox-section__header">
                    <h4 class="oltb-toolbox-section__title oltb-toggleable" data-oltb-toggleable-target="${ID_PREFIX}-feature-toolbox-collapsed">
                        Feature layers
                        <span class="oltb-toolbox-section__icon oltb-tippy" title="Toggle section"></span>
                    </h4>
                </div>
                <div class="oltb-toolbox-section__groups" id="${ID_PREFIX}-feature-toolbox-collapsed" style="display: ${this.localStorage[`${ID_PREFIX}-feature-toolbox-collapsed`] ? 'none' : 'block'}">
                    <div class="oltb-toolbox-section__group">
                        ${
                            !this.options.disableFeatureCreateLayerButton ? 
                            `
                                <div class="oltb-input-button-group">
                                    <input type="text" id="${ID_PREFIX}-feature-stack-add-text" class="oltb-input" placeholder="Layer name">
                                    <button type="button" id="${ID_PREFIX}-feature-stack-add-button" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="Create feature layer">
                                        ${getIcon({
                                            path: SVG_PATHS.Plus.Stroked,
                                            width: 20,
                                            height: 20,
                                            fill: 'none',
                                            stroke: 'rgb(255, 255, 255)',
                                            class: 'oltb-btn__icon'
                                        })}
                                    </button>
                                </div>
                            ` : ''
                        }
                    </div>
                    <div class="oltb-toolbox-section__group ${this.options.disableFeatureCreateLayerButton ? 'oltb-toolbox-section__group--topmost' : ''} oltb-m-0">
                        <ul id="${ID_PREFIX}-feature-stack" class="oltb-toolbox-list oltb-toolbox-list--selectable"></ul>
                    </div>
                </div>
            </div>
        `);

        this.layersToolbox = document.querySelector(`#${ID_PREFIX}-toolbox`);

        const toggleableTriggers = this.layersToolbox.querySelectorAll('.oltb-toggleable');
        toggleableTriggers.forEach((toggle) => {
            toggle.addEventListener(EVENTS.Browser.Click, this.onToggleToolbox.bind(this, toggle));
        });

        this.mapLayerStack = this.layersToolbox.querySelector(`#${ID_PREFIX}-map-stack`);
        this.featureLayerStack = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack`);

        this.addFeatureLayerButton = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack-add-button`);
        this.addFeatureLayerText = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack-add-text`);

        if(this.addFeatureLayerButton) {
            this.addFeatureLayerButton.addEventListener(EVENTS.Browser.Click, this.onFeatureLayerAdd.bind(this));
        }

        if(this.addFeatureLayerText) {
            this.addFeatureLayerText.addEventListener(EVENTS.Browser.KeyUp, this.onFeatureLayerAdd.bind(this));
        }

        const addMapLayerButton = this.layersToolbox.querySelector(`#${ID_PREFIX}-map-stack-add-button`);
        if(addMapLayerButton) {
            addMapLayerButton.addEventListener(EVENTS.Browser.Click, this.showAddMapLayerModal.bind(this));
        }

        if(!this.options.disableMapCreateLayerButton) {
            ContextMenu.addItem({
                icon: icon, 
                name: 'Add map layer', 
                fn: this.onContextMenuAddMapLayerModal.bind(this)
            });
        }

        window.addEventListener(EVENTS.Custom.MapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(EVENTS.Custom.MapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Custom.FeatureLayerAdded, this.onWindowFeatureLayerAdded.bind(this));
        window.addEventListener(EVENTS.Custom.FeatureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
        window.addEventListener(EVENTS.Browser.ContentLoaded, this.onDOMContentLoaded.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName)?.slideToggle(CONFIG.AnimationDuration.Fast, (collapsed) => {
            this.localStorage[targetName] = collapsed;
            StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
        });
    }

    onDOMContentLoaded() {
        if(this.localStorage.active) {
            this.activateTool();
        }
    }

    onWindowKeyUp(event) {
        if(isShortcutKeyOnly(event, SHORTCUT_KEYS.Layer)) {
            this.handleClick(event);
        }
    }

    onContextMenuAddMapLayerModal() {
        this.showAddMapLayerModal();
    }

    onFeatureLayerAdd(event) {
        if(
            event.type === EVENTS.Browser.KeyUp && 
            event.key.toLowerCase() !== KEYS.Enter
        ) {
            return;
        }

        LayerManager.addFeatureLayer(this.addFeatureLayerText.value);
        this.addFeatureLayerText.value = '';
    }

    handleClick() {
        LogManager.logDebug(FILENAME, 'handleClick', 'User clicked tool');
        
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        if(this.active) {
            this.deActivateTool();
        }else {
            this.activateTool();
        }
    }

    activateTool() {
        this.active = true;
        this.layersToolbox.classList.add('oltb-toolbox-section--show');
        this.button.classList.add('oltb-tool-button--active');

        this.localStorage.active = true;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    deActivateTool() {
        this.active = false;
        this.layersToolbox.classList.remove('oltb-toolbox-section--show');
        this.button.classList.remove('oltb-tool-button--active');

        this.localStorage.active = false;
        StateManager.setStateObject(LOCAL_STORAGE_NODE_NAME, this.localStorage);
    }

    showAddMapLayerModal() {
        const layerModal = new LayerModal({
            onCreate: (result) => {
                try {
                    LayerManager.addMapLayer({
                        name: result.name,
                        layer: instantiateLayer(result.layer, {
                            projection: result.projection || CONFIG.Projection.Default,
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
                    LogManager.logError(FILENAME, 'showAddMapLayerModal', {
                        message: errorMessage,
                        error: error
                    });
                    Toast.error({
                        title: 'Error',
                        message: errorMessage
                    });
                }
            }
        });
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
        if(typeof this.options.mapLayerAdded === 'function' && !silent) {
            this.options.mapLayerAdded(layerWrapper);
        }
    }

    onWindowMapLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const layerWrapper = event.detail.layerWrapper;
        const silent = event.detail.silent;

        // Remove layer from UI
        this.mapLayerStack.querySelector(`#${ID_PREFIX}-map-${layerWrapper.id}`).remove();

        // User defined callback from constructor
        if(typeof this.options.mapLayerRemoved === 'function' && !silent) {
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
        if(typeof this.options.featureLayerAdded === 'function' && !silent) {
            this.options.featureLayerAdded(layerWrapper);
        }
    }

    onWindowFeatureLayerRemoved(event) {
        InfoWindowManager.hideOverlay();

        const layerWrapper = event.detail.layerWrapper;
        const silent = event.detail.silent;

        // Remove layer from UI
        this.featureLayerStack.querySelector(`#${ID_PREFIX}-feature-${layerWrapper.id}`).remove();

        // Set top-most-layer tas the active layer
        // Important that it is the first child, the LayerManager uses the first next layer
        const numLayers = this.featureLayerStack.querySelectorAll('li').length;
        if(numLayers > 0) {
            this.featureLayerStack.firstChild.classList.add('oltb-toolbox-list__item--active');
        }

        // User defined callback from constructor
        if(typeof this.options.featureLayerRemoved === 'function' && !silent) {
            this.options.featureLayerRemoved(layerWrapper);
        }
    }

    createLayerItem(layerWrapper, options) {
        // Should just be one li-item that has the active class, but just in case
        this.featureLayerStack.querySelectorAll('li').forEach((layer) => {
            layer.classList.remove('oltb-toolbox-list__item--active');
        });

        const layerElement = DOM.createElement({
            element: 'li', 
            id: `${options.idPrefix}-${layerWrapper.id}`,
            class: `oltb-toolbox-list__item oltb-toolbox-list__item--active ${(!layerWrapper.layer.getVisible() ? ' oltb-toolbox-list__item--hidden' : '')}`
        });

        // Eventlistener to update the UI if the visibility of the layer is changed
        // Other tools may change a layers visibility and the UI must be updated in this event
        layerWrapper.layer.on(EVENTS.OpenLayers.PropertyChange, function(event) {
            if(event.key === 'visible') {
                layerElement.classList.toggle('oltb-toolbox-list__item--hidden');
            }
        });

        const layerName = DOM.createElement({
            element: 'span', 
            text: layerWrapper.name.ellipsis(20),
            class: 'oltb-toolbox-list__title',
            title: layerWrapper.name
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
        if(options.idPrefix === `${ID_PREFIX}-feature`) {
            layerName.addEventListener(EVENTS.Browser.Click, (event) => {
                LayerManager.setActiveFeatureLayer(layerWrapper);
                // Should just be one li-item that has the active class, but just in case
                this.featureLayerStack.querySelectorAll('li').forEach((layer) => {
                    layer.classList.remove('oltb-toolbox-list__item--active')
                });
                    
                // Set the new layer as the active layer
                layerName.closest('li').classList.add('oltb-toolbox-list__item--active');
            });
        }

        const leftButtonWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-toolbox-list__wrapper' 
        });

        leftButtonWrapper.appendChild(layerName);
        layerElement.appendChild(leftButtonWrapper);

        const rightButtonWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-toolbox-list__wrapper'
        });

        // Add all buttons to the layer
        for(const name in options.buttons) {
            rightButtonWrapper.appendChild(options.buttons[name].function.call(
                this,
                layerWrapper,
                options.buttons[name].callback,
                layerName
            ));
        }

        layerElement.appendChild(rightButtonWrapper);

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
                        message: `Do you want to delete the <strong>${layerWrapper.name}</strong> layer?`,
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
                            const format = instantiateFormat(result.format);
            
                            if(!format) {
                                Toast.error({
                                    title: 'Error',
                                    message: 'This layer format is not supported'
                                });
                                
                                return;
                            }
            
                            const features = layerWrapper.layer.getSource().getFeatures();
                            const formatString = format.writeFeatures(features, {
                                featureProjection: CONFIG.Projection.Default
                            });
                        
                            const fileName = `${layerWrapper.name}.${result.format.toLowerCase()}`;
                            download(fileName, formatString);
            
                            // User defined callback from constructor
                            if(typeof callback === 'function') {
                                callback(layerWrapper);
                            }
                        }
                    });
                }
            }
        });

        return downloadButton;
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
                        message: `You are editing the <strong>${layerWrapper.name}</strong> layer`,
                        value: layerWrapper.name,
                        confirmText: 'Rename',
                        onConfirm: function(result) {
                            if(result !== null && !!result.length) {
                                layerWrapper.name = result;
                                layerName.innerText = result.ellipsis(20);
                                layerName._tippy.setContent(result);
                                
                                // User defined callback from constructor
                                if(typeof callback === 'function') {
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

                    const flippedVisibility = !layerWrapper.layer.getVisible();
                    layerWrapper.layer.setVisible(flippedVisibility);
                     
                    // Hide overlays associated with the layer
                    const hasFeatures = typeof layerWrapper.layer.getSource().getFeatures === 'function';
                    if(hasFeatures) {
                        layerWrapper.layer.getSource().getFeatures().forEach((feature) => {
                            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.Tooltip)) {
                                feature.getProperties().oltb.tooltip.setMap(flippedVisibility ? map : null)
                            }
                        });
                    }

                    // User defined callback from constructor
                    if(typeof callback === 'function') {
                        callback(layerWrapper);
                    }
                }
            }
        });

        return visibilityButton;
    }
}

export { LayerTool };
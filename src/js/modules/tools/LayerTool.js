import LayerManager from '../core/managers/LayerManager';
import Dialog from '../common/Dialog';
import LayerModal from './modal-extensions/LayerModal';
import DOM from '../helpers/Browser/DOM';
import CONFIG from '../core/Config';
import InfoWindowManager from '../core/managers/InfoWindowManager';
import StateManager from '../core/managers/StateManager';
import Toast from '../common/Toast';
import DownloadLayerModal from './modal-extensions/DownloadLayerModal';
import tippy from 'tippy.js';
import { Control } from 'ol/control';
import { TOOLBOX_ELEMENT, TOOLBAR_ELEMENT } from '../core/ElementReferences';
import { download } from '../helpers/Browser/Download';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVG_PATHS, getIcon } from '../core/SVGIcons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';
import { instantiateLayer } from '../core/ol-types/LayerTypes';
import { instantiateSource } from '../core/ol-types/SourceTypes';
import { instantiateFormat } from '../core/ol-types/FormatTypes';
import { hasNestedProperty } from '../helpers/HasNestedProperty';
import { SHORTCUT_KEYS } from '../helpers/constants/ShortcutKeys';
import { EVENTS } from '../helpers/constants/Events';
import { CONTEXT_MENUS } from '../helpers/constants/ContextMenus';

const LAYER_BUTTON_DEFAULT_CLASSES = 'oltb-func-btn';
const ID_PREFIX = 'oltb-layer';

/* 
    Because this tool has two different sections that can be collapsed it's not a viable solution to have a single collapsed property. 
    Unfortunately this results in two longer names stored in localStorage.
*/
const LOCAL_STORAGE_NODE_NAME = 'layerTool';
const LOCAL_STORAGE_DEFAULTS = {
    'oltb-layer-map-toolbox-collapsed': false,
    'oltb-layer-feature-toolbox-collapsed': false,
};

const DEFAULT_OPTIONS = {
    disableMapCreateLayerButton: false,
    disableMapLayerVisibilityButton: false,
    disableMapLayerEditButton: false,
    disableMapLayerDeleteButton: false,
    disableFeatureCreateLayerButton: false,
    disableFeatureLayerVisibilityButton: false,
    disableFeatureLayerEditButton: false,
    disableFeatureLayerDeleteButton: false,
    disableFeatureLayerDownloadButton: false
};

class LayerTool extends Control {
    constructor(options = {}) {
        super({
            element: TOOLBAR_ELEMENT
        });
        
        const icon = getIcon({
            path: SVG_PATHS.Layers,
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

        // Load potential stored data from localStorage
        const localStorageState = JSON.parse(StateManager.getStateObject(LOCAL_STORAGE_NODE_NAME)) || {};
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
                                <button type="button" id="${ID_PREFIX}-map-stack-add-btn" class="oltb-btn oltb-btn--green-mid oltb-w-100">Create map layer</button>
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
                                    <input type="text" id="${ID_PREFIX}-feature-stack-add-txt" class="oltb-input" placeholder="Layer name">
                                    <button type="button" id="${ID_PREFIX}-feature-stack-add-btn" class="oltb-btn oltb-btn--green-mid oltb-tippy" title="Create feature layer">
                                        ${getIcon({
                                            path: SVG_PATHS.PlusSmall,
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

        this.addFeatureLayerBtn = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack-add-btn`);
        this.addFeatureLayerTxt = this.layersToolbox.querySelector(`#${ID_PREFIX}-feature-stack-add-txt`);

        if(this.addFeatureLayerBtn) {
            this.addFeatureLayerBtn.addEventListener(EVENTS.Browser.Click, this.onFeatureLayerAdd.bind(this));
        }

        if(this.addFeatureLayerTxt) {
            this.addFeatureLayerTxt.addEventListener(EVENTS.Browser.KeyUp, this.onFeatureLayerAdd.bind(this));
        }

        const addMapLayerBtn = this.layersToolbox.querySelector(`#${ID_PREFIX}-map-stack-add-btn`);
        if(addMapLayerBtn) {
            addMapLayerBtn.addEventListener(EVENTS.Browser.Click, this.showAddMapLayerModal.bind(this));
        }

        if(!this.options.disableMapCreateLayerButton) {
            addContextMenuItem(CONTEXT_MENUS.MainMap, {icon: icon, name: 'Add map layer', fn: this.onContextMenuAddMapLayerModal.bind(this)});
        }

        window.addEventListener(EVENTS.Custom.MapLayerAdded, this.onWindowMapLayerAdded.bind(this));
        window.addEventListener(EVENTS.Custom.MapLayerRemoved, this.onWindowMapLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Custom.FeatureLayerAdded, this.onWindowFeatureLayerAdded.bind(this));
        window.addEventListener(EVENTS.Custom.FeatureLayerRemoved, this.onWindowFeatureLayerRemoved.bind(this));
        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onToggleToolbox(toggle) {
        const targetName = toggle.dataset.oltbToggleableTarget;
        document.getElementById(targetName).slideToggle(200, (collapsed) => {
            this.localStorage[targetName] = collapsed;
            StateManager.updateStateObject(LOCAL_STORAGE_NODE_NAME, JSON.stringify(this.localStorage));
        });
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
        if(event.type === 'keyup' && event.key.toLowerCase() !== 'enter') {
            return;
        }

        LayerManager.addFeatureLayer(this.addFeatureLayerTxt.value);
        this.addFeatureLayerTxt.value = '';
    }

    handleClick() {
        // User defined callback from constructor
        if(typeof this.options.click === 'function') {
            this.options.click();
        }
        
        this.handleLayers();
    }

    handleLayers() {
        this.active = !this.active;
        this.layersToolbox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }

    showAddMapLayerModal() {
        const layerModal = new LayerModal(function(result) {
            try {
                LayerManager.addMapLayer({
                    name: result.name,
                    layer: instantiateLayer(result.layer, {
                        projection: result.projection || CONFIG.projection,
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
                console.error(`Error adding layer [${error}]`);
                Toast.error({text: 'Something went wrong adding the layer'});
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
        const layerWrapper = event.detail.layerWrapper;
        const silent = event.detail.silent;

        // Remove layer from UI
        this.mapLayerStack.querySelector(`#map-layer-${layerWrapper.id}`).remove();

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

        // Create layer baser item - li
        const layerElement = DOM.createElement({
            element: 'li', 
            id: `${options.idPrefix}-${layerWrapper.id}`,
            class: 'oltb-toolbox-list__item oltb-toolbox-list__item--active' + (!layerWrapper.layer.getVisible() ? ' oltb-toolbox-list__item--hidden' : '')
        });

        // Eventlistener to update the UI if the visibility of the layer is changed
        // Other tools may change a layers visibility and the UI must be updated in this event
        layerWrapper.layer.on(EVENTS.Ol.PropertyChange, function(event) {
            if(event.key === 'visible') {
                layerElement.classList.toggle('oltb-toolbox-list__item--hidden');
            }
        });

        // Create layer name label
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
                console.log('sdfadfasd');
                LayerManager.setActiveFeatureLayer(layerWrapper);
                // Should just be one li-item that has the active class, but just in case
                this.featureLayerStack.querySelectorAll('li').forEach((layer) => {
                    layer.classList.remove('oltb-toolbox-list__item--active')
                });
                    
                // Set the new layer as the active layer
                layerName.closest('li').classList.add('oltb-toolbox-list__item--active');
            });
        }

        // Create div for holding left side of layer item
        const leftButtonWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-toolbox-list__wrapper' 
        });

        leftButtonWrapper.appendChild(layerName);
        layerElement.appendChild(leftButtonWrapper);

        // Create div for holding right side of layer item
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
            class: LAYER_BUTTON_DEFAULT_CLASSES + ' oltb-func-btn--delete oltb-tippy',
            title: 'Delete layer',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    Dialog.confirm({
                        html: `Do you want to delete layer <strong>${layerWrapper.name}</strong>?`,
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
            class: LAYER_BUTTON_DEFAULT_CLASSES + ' oltb-func-btn--download oltb-tippy',
            title: 'Download layer',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    const downloadModal = new DownloadLayerModal(function(result) {   
                        const format = instantiateFormat(result.format);
        
                        if(!format) {
                            Toast.error({text: 'Unsupported layer format'});
                            return;
                        }
        
                        const features = layerWrapper.layer.getSource().getFeatures();
                        const formatString = format.writeFeatures(features, {
                            featureProjection: CONFIG.projection,
                            dataProjection: CONFIG.projection
                        });
                    
                        const fileName = layerWrapper.name + '.' + result.format.toLowerCase();
                        download(fileName, formatString);
        
                        // User defined callback from constructor
                        if(typeof callback === 'function') {
                            callback(layerWrapper);
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
            class: LAYER_BUTTON_DEFAULT_CLASSES + ' oltb-func-btn--edit oltb-tippy',
            title: 'Rename layer',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    Dialog.prompt({
                        text: 'Edit layer name',
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
            class: LAYER_BUTTON_DEFAULT_CLASSES + ' oltb-func-btn--visibility oltb-tippy',
            title: 'Toggle visibility',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    InfoWindowManager.hideOverlay();

                    const flippedVisibility = !layerWrapper.layer.getVisible();
                    layerWrapper.layer.setVisible(flippedVisibility);
                     
                    // Hide potential overlays associated with that layer
                    const hasFeatures = typeof layerWrapper.layer.getSource().getFeatures === 'function';
                    if(hasFeatures) {
                        layerWrapper.layer.getSource().getFeatures().forEach((feature) => {
                            if(hasNestedProperty(feature.getProperties(), 'tooltipOverlay')) {
                                feature.getProperties().tooltipOverlay.setMap(flippedVisibility ? map : null)
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

export default LayerTool;
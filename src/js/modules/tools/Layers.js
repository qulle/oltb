import 'ol/ol.css';
import LayerManager from '../core/Managers/LayerManager';
import Dialog from '../common/Dialog';
import LayerModal from './ModalExtensions/LayerModal';
import GeoJSON from 'ol/format/GeoJSON';
import DOM from '../helpers/DOM';
import EventType from 'ol/events/EventType';
import SourceTypes from '../core/olTypes/SourceTypes';
import LayerTypes from '../core/olTypes/LayerTypes';
import FormatTypes from '../core/olTypes/FormatTypes';
import Config from '../core/Config';
import InfoWindowManager from '../core/Managers/InfoWindowManager';
import Toast from '../common/Toast';
import { Control } from 'ol/control';
import { toolboxElement, toolbarElement } from '../core/ElementReferences';
import { download } from '../helpers/Download';
import { addContextMenuItem } from '../common/ContextMenu';
import { SVGPaths, getIcon } from '../core/Icons';
import { isShortcutKeyOnly } from '../helpers/ShortcutKeyOnly';

const layerButtonDefaultClasses = 'oltb-func-btn';

class Layers extends Control {
    constructor(callbacksObj = {}) {
        super({
            element: toolbarElement
        });
        
        const icon = getIcon({
            path: SVGPaths.Layers,
            class: 'oltb-tool-button__icon'
        });

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-tippy-content', 'Layers (L)');
        button.className = 'oltb-tool-button';
        button.innerHTML = icon;
        button.addEventListener(
            EventType.CLICK,
            this.handleClick.bind(this),
            false
        );

        this.element.appendChild(button);
        this.button = button;
        this.active = false;
        this.callbacksObj = callbacksObj;

        toolboxElement.insertAdjacentHTML('beforeend', `
            <div id="oltb-layers-box" class="oltb-toolbox-section">
                <div class="oltb-toolbox-section__group">
                    <h4 class="oltb-toolbox-section__title">Map layers</h4>
                    <button type="button" id="oltb-add-map-layer-btn" class="oltb-btn oltb-btn--green-dark oltb-w-100">Create map layer</button>
                </div>
                <div class="oltb-toolbox-section__group">
                    <ul id="oltb-map-layer-stack" class="oltb-toolbox-list"></ul>
                </div>
                <div class="oltb-toolbox-section__group">
                    <h4 class="oltb-toolbox-section__title">Feature layers</h4>
                    <div class="oltb-input-button-group">
                        <input type="text" id="oltb-add-feature-layer-txt" class="oltb-input" placeholder="Layer name">
                        <button type="button" id="oltb-add-feature-layer-btn" class="oltb-btn oltb-btn--green-dark oltb-tippy" title="Create feature layer">
                            ${getIcon({
                                path: SVGPaths.PlusSmall,
                                width: 20,
                                height: 20,
                                fill: 'none',
                                stroke: 'rgb(255, 255, 255)'
                            })}
                        </button>
                    </div>
                </div>
                <div class="oltb-toolbox-section__group">
                    <ul id="oltb-feature-layer-stack" class="oltb-toolbox-list oltb-toolbox-list--selectable"></ul>
                </div>
            </div>
        `);

        const layersToolbox = document.querySelector('#oltb-layers-box');
        this.layersToolbox = layersToolbox;
        
        const mapLayerStack = layersToolbox.querySelector('#oltb-map-layer-stack');
        this.mapLayerStack = mapLayerStack;

        LayerManager.getMapLayers().forEach(mapLayer => {
            this.createMapLayerItem(mapLayer);
        });

        const featureLayerStack = layersToolbox.querySelector('#oltb-feature-layer-stack');
        this.featureLayerStack = featureLayerStack;

        const addFeatureLayerBtn = layersToolbox.querySelector('#oltb-add-feature-layer-btn');
        const addFeatureLayerTxt = layersToolbox.querySelector('#oltb-add-feature-layer-txt');

        addFeatureLayerBtn.addEventListener('click', function(event) {
            event.preventDefault();

            LayerManager.addFeatureLayer(addFeatureLayerTxt.value);
            addFeatureLayerTxt.value = '';
        });

        addFeatureLayerTxt.addEventListener('keyup', function(event) {
            if(event.key === 'Enter') {
                LayerManager.addFeatureLayer(addFeatureLayerTxt.value);
                addFeatureLayerTxt.value = '';
            }
        });

        const addMapLayerBtn = layersToolbox.querySelector('#oltb-add-map-layer-btn');
        addMapLayerBtn.addEventListener('click', this.showAddMapLayerModal.bind(this));

        addContextMenuItem('main.map.context.menu', {icon: icon, name: 'Add map layer', fn: this.showAddMapLayerModal.bind(this)});

        window.addEventListener('oltb.mapLayer.added', this.mapLayerAdded.bind(this));
        window.addEventListener('oltb.mapLayer.removed', this.mapLayerRemoved.bind(this));

        window.addEventListener('oltb.featureLayer.added', this.featureLayerAdded.bind(this));
        window.addEventListener('oltb.featureLayer.removed', this.featureLayerRemoved.bind(this));

        window.addEventListener('keyup', (event) => {
            if(isShortcutKeyOnly(event, 'l')) {
                this.handleClick(event);
            }
        });
    }

    handleClick(event) {
        event.preventDefault();
        this.handleLayers();
    }

    handleLayers() {
        this.active = !this.active;
        this.layersToolbox.classList.toggle('oltb-toolbox-section--show');
        this.button.classList.toggle('oltb-tool-button--active');
    }

    showAddMapLayerModal() {
        new LayerModal(function(response) {
            try {
                LayerManager.addMapLayer({
                    name: response.name,
                    layer: new LayerTypes[response.layer]({
                        projection: response.projection || Config.baseProjection,
                        source: new SourceTypes[response.source]({
                            url: response.url,
                            params: JSON.parse(response.parameters),
                            wrapX: response.wrapX,
                            attributions: response.attributions,
                            format: response.source in FormatTypes ? 
                                new FormatTypes[response.source]() : 
                                null
                        })
                    })
                });
            }catch(error) {
                console.error(error);
                Toast.error({text: 'Something went wrong adding the layer'});
            }
        });
    }

    mapLayerAdded(event) {
        const layerObject = event.detail.layerObject;
        const silent = event.detail.silent;

        // Add to UI
        this.createLayerItem(layerObject, {
            idPrefix: 'map-layer',
            target: this.mapLayerStack,
            buttons: {
                visibilityButton: {
                    function: this.createVisibilityButton, 
                    callback: this.callbacksObj.mapLayerVisibilityChanged
                },
                editButton: {
                    function: this.createEditButton,
                    callback: this.callbacksObj.mapLayerRenamed
                },
                deleteButton: {
                    function: this.createDeleteButton,
                    callback: LayerManager.removeMapLayer.bind(LayerManager)
                }
            }
        });

        // User defined callback from constructor
        if(typeof this.callbacksObj.mapLayerAdded === 'function' && !silent) {
            this.callbacksObj.mapLayerAdded(layerObject);
        }
    }

    mapLayerRemoved(event) {
        const layerObject = event.detail.layerObject;
        const silent = event.detail.silent;

        // Remove layer from UI
        this.mapLayerStack.querySelector(`#map-layer-${layerObject.id}`).remove();

        // User defined callback from constructor
        if(typeof this.callbacksObj.mapLayerRemoved === 'function' && !silent) {
            this.callbacksObj.mapLayerRemoved(layerObject);
        }
    }

    featureLayerAdded(event) {
        const layerObject = event.detail.layerObject;
        const silent = event.detail.silent;

        // Add to UI
        this.createLayerItem(layerObject, {
            idPrefix: 'oltb-feature-layer',
            target: this.featureLayerStack,
            buttons: {
                visibilityButton: {
                    function: this.createVisibilityButton, 
                    callback: this.callbacksObj.featureLayerVisibilityChanged
                },
                editButton: {
                    function: this.createEditButton,
                    callback: this.callbacksObj.featureLayerRenamed
                },
                downloadButton: {
                    function: this.createDownloadButton,
                    callback: this.callbacksObj.featureLayerDownloaded
                },
                deleteButton: {
                    function: this.createDeleteButton,
                    callback: LayerManager.removeFeatureLayer.bind(LayerManager)
                }
            }
        });

        // User defined callback from constructor
        if(typeof this.callbacksObj.featureLayerAdded === 'function' && !silent) {
            this.callbacksObj.featureLayerAdded(layerObject);
        }
    }

    featureLayerRemoved(event) {
        const layerObject = event.detail.layerObject;
        const silent = event.detail.silent;

        // Remove layer from UI
        this.featureLayerStack.querySelector(`#oltb-feature-layer-${layerObject.id}`).remove();

        // Set top-most-layer tas the active layer
        // Important that it is the first child, the LayerManager uses the first next layer
        const numLayers = this.featureLayerStack.querySelectorAll('li').length;
        if(numLayers > 0) {
            this.featureLayerStack.firstChild.classList.add('oltb-toolbox-list__item--active');
        }

        // User defined callback from constructor
        if(typeof this.callbacksObj.featureLayerRemoved === 'function' && !silent) {
            this.callbacksObj.featureLayerRemoved(layerObject);
        }
    }

    createLayerItem(layerObject, options) {
        // Should just be one li-item that has the active class, but just in case
        this.featureLayerStack.querySelectorAll('li').forEach((layer) => {
            layer.classList.remove('oltb-toolbox-list__item--active');
        });

        // Create layer baser item - li
        const layerElement = DOM.createElement({element: 'li', 
            attributes: {
                id: `${options.idPrefix}-${layerObject.id}`,
                class: 'oltb-toolbox-list__item oltb-toolbox-list__item--active' + (!layerObject.layer.getVisible() ? ' oltb-toolbox-list__item--hidden' : '')
            }
        });

        // Eventlistener to update the UI if the visibility of the layer is changed
        // Other tools may change a layers visibility and the UI must be updated in this event
        layerObject.layer.on('propertychange', function(event) {
            const property = event.key;
            if(property === 'visible') {
                layerElement.classList.toggle('oltb-toolbox-list__item--hidden');
            }
        });

        // Create layer name label
        const layerName = DOM.createElement({element: 'span', 
            text: layerObject.name.ellipsis(20),
            attributes: {
                class: 'oltb-toolbox-list__title oltb-tippy',
                title: layerObject.name,
            }
        });

        // If feature layer - attach eventlistener for setting the active layer
        if(options.idPrefix === 'oltb-feature-layer') {
            layerName.addEventListener('click', (event) => {
                LayerManager.setActiveFeatureLayer(layerObject);
                // Should just be one li-item that has the active class, but just in case
                this.featureLayerStack.querySelectorAll('li').forEach(layer => layer.classList.remove('oltb-toolbox-list__item--active'));
                // Set the new layer as the active layer
                layerName.closest('li').classList.add('oltb-toolbox-list__item--active');
            });
        }

        // Create div for holding left side of layer item
        const leftButtonWrapper = DOM.createElement({element: 'div', 
            attributes: {
                class: 'oltb-toolbox-list__wrapper'
            }
        });

        leftButtonWrapper.appendChild(layerName);
        layerElement.appendChild(leftButtonWrapper);

        // Create div for holding right side of layer item
        const rightButtonWrapper = DOM.createElement({element: 'div', 
            attributes: {
                class: 'oltb-toolbox-list__wrapper'
            }
        });

        // Add all buttons to the layer
        for(const name in options.buttons) {
            rightButtonWrapper.appendChild(options.buttons[name].function.call(
                this,
                layerObject,
                options.buttons[name].callback,
                layerName
            ));
        }

        layerElement.appendChild(rightButtonWrapper);

        // Add the created layer item to the user interface
        options.target.prepend(layerElement);
    }

    createDeleteButton(layerObject, callback) {
        const deleteButton = DOM.createElement({element: 'button',
            attributes: {
                type: 'button',
                class: layerButtonDefaultClasses + ' oltb-func-btn--delete oltb-tippy',
                title: 'Delete layer',
            }
        });

        deleteButton.addEventListener('click', function(event) {
            Dialog.confirm({
                html: `Do you want to delete layer <strong>${layerObject.name}</strong>?`,
                onConfirm: function() {
                    callback(layerObject);
                }
            });
        });

        return deleteButton;
    }

    createDownloadButton(layerObject, callback) {
        const downloadButton = DOM.createElement({element: 'button', 
            attributes: {
                type: 'button',
                class: layerButtonDefaultClasses + ' oltb-func-btn--download oltb-tippy',
                title: 'Download layer as geojson'
            }
        });

        downloadButton.addEventListener('click', function(event) {
            const features = new GeoJSON().writeFeatures(
                layerObject.layer.getSource().getFeatures(), 
                {featureProjection: Config.baseProjection}
            );
            
            download(layerObject.name + '.geojson', features);

            // User defined callback from constructor
            if(typeof callback === 'function') {
                callback(layerObject);
            }
        });

        return downloadButton;
    }

    createEditButton(layerObject, callback, layerName) {
        const editButton = DOM.createElement({element: 'button',
            attributes: {
                type: 'button',
                class: layerButtonDefaultClasses + ' oltb-func-btn--edit oltb-tippy',
                title: 'Rename layer'
            }
        });

        editButton.addEventListener('click', function(event) {
            Dialog.prompt({
                text: 'Edit layer name',
                value: layerObject.name,
                confirmText: 'Rename',
                onConfirm: function(result) {
                    if(result !== null && !!result.length) {
                        layerObject.name = result;
                        layerName.innerText = result.ellipsis(20);
                        layerName._tippy.setContent(result);
                        
                        // User defined callback from constructor
                        if(typeof callback === 'function') {
                            callback(layerObject);
                        }
                    }
                }
            });
        });

        return editButton;
    }

    createVisibilityButton(layerObject, callback, layerName) {
        const map = this.getMap();

        const visibilityButton = DOM.createElement({element: 'button',
            attributes: {
                type: 'button',
                class: layerButtonDefaultClasses + ' oltb-func-btn--visibility oltb-tippy',
                title: 'Toggle visibility'
            }
        });

        visibilityButton.addEventListener('click', function(event) {
            InfoWindowManager.hideOverlay();

            const flippedVisibility = !layerObject.layer.getVisible();
            layerObject.layer.setVisible(flippedVisibility);
            
            // Hide potential overlays associated with that layer
            const hasFeatures = typeof layerObject.layer.getSource().getFeatures === 'function';
            if(hasFeatures) {
                layerObject.layer.getSource().getFeatures().forEach(feature => {
                    if('attributes' in feature && 'tooltipOverlay' in feature.attributes) {
                        flippedVisibility ? 
                            feature.attributes.tooltipOverlay.setMap(map) : 
                            feature.attributes.tooltipOverlay.setMap(null);
                    }
                });
            }

            // User defined callback from constructor
            if(typeof callback === 'function') {
                callback(layerObject);
            }
        });

        return visibilityButton;
    }
}

export default Layers;
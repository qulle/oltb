import { Events } from '../../helpers/constants/Events';
import { LogManager } from '../managers/LogManager';
import { v4 as uuidv4 } from 'uuid';
import { FeatureProperties } from '../../helpers/constants/FeatureProperties';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { hasCustomFeatureProperty } from '../../helpers/browser/HasNestedProperty';

const FILENAME = 'managers/LayerManager.js';
const DEFAULT_LAYER_NAME = 'New layer';

const ZINDEX_BASE_MAP_LAYER = 1;
const ZINDEX_BASE_FEATURE_LAYER = 1e6;

const DefaultFeatureLayerOptions = Object.freeze({
    name: '',
    visible: true,
    silent: false,
    disableFeatureLayerVisibilityButton: false,
    disableFeatureLayerEditButton: false,
    disableFeatureLayerDownloadButton: false,
    disableFeatureLayerDeleteButton: false
});

const DefaultMapLayerOptions = Object.freeze({
    visible: true,
    silent: false,
    disableMapLayerVisibilityButton: false,
    disableMapLayerEditButton: false,
    disableMapLayerDeleteButton: false
});

class LayerManager {
    static #map;
    static #activeFeatureLayer;

    static #queue = {
        mapLayers: [],
        featureLayers: []
    };

    static #layers = {
        mapLayers: [],
        featureLayers: []
    };

    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
    }

    static setMap(map) { 
        LogManager.logInformation(FILENAME, 'setMap', {
            adding: {
                mapLayers: this.#queue.mapLayers.length,
                featureLayers: this.#queue.featureLayers.length
            }
        });

        this.#map = map;

        // Handle queue of map-layers that was added before the map was ready
        this.#queue.mapLayers.forEach((item) => {
            this.#addMapLayerToMap(item.layerWrapper, item.options);
        });

        this.#queue.mapLayers = [];

        // Handle queue of feature-layers that was added before the map was ready
        this.#queue.featureLayers.forEach((item) => {
            this.#addFeatureLayerToMap(item.layerWrapper, item.options);
        });

        this.#queue.featureLayers = [];
    }

    static #addPropertiesInterface(layerWrapper) {
        layerWrapper.getLayer = function() {
            return this.layer;
        }

        layerWrapper.setLayer = function(layer) {
            this.layer = layer;
        }

        layerWrapper.getName = function() {
            return this.name;
        }

        layerWrapper.setName = function(name) {
            this.name = name;
        }

        layerWrapper.getId = function() {
            return this.id;
        }

        layerWrapper.setId = function(id) {
            this.id = id;
        }
    }

    static #validateName(name) {
        name = name.trim();

        if(!name.length) {
            name = DEFAULT_LAYER_NAME;
        }

        return name;
    }

    //-------------------------------------------
    // Map layers specific
    //-------------------------------------------

    static addMapLayers(layerWrappers, options = {}) {
        for(let index in layerWrappers) {
            this.addMapLayer(layerWrappers[index], options);
        }
    }

    static addMapLayer(layerWrapper, options = {}) {
        layerWrapper.name = this.#validateName(layerWrapper.name);
        LogManager.logDebug(FILENAME, 'addMapLayer', layerWrapper.name);

        const mergedOptions = { ...DefaultMapLayerOptions, ...options };
        this.#addPropertiesInterface(layerWrapper);

        if(!layerWrapper.getId()) {
            const layerId = uuidv4();
            layerWrapper.setId(layerId);
        }

        if(this.#map) {
            this.#addMapLayerToMap(layerWrapper, mergedOptions);
        }else {
            this.#queue.mapLayers.push({
                layerWrapper: layerWrapper, 
                options: mergedOptions
            });
        }
    }

    static #addMapLayerToMap(layerWrapper, options) {
        this.#layers.mapLayers.push(layerWrapper);
        this.#map.addLayer(layerWrapper.getLayer());

        window.dispatchEvent(new CustomEvent(Events.custom.mapLayerAdded, {
            detail: {
                layerWrapper: layerWrapper, 
                silent: options.silent,
                disableMapLayerVisibilityButton: options.disableMapLayerVisibilityButton,
                disableMapLayerEditButton: options.disableMapLayerEditButton,
                disableMapLayerDeleteButton: options.disableMapLayerDeleteButton
            }
        }));
    }

    static removeMapLayer(layerWrapper, silent = false) {
        LogManager.logDebug(FILENAME, 'removeMapLayer', layerWrapper.getName());

        // Remove the layer from the internal collection
        this.#layers.mapLayers = this.#layers.mapLayers.filter((layer) => {
            return layer.getId() !== layerWrapper.getId();
        }); 

        // Remove the actual ol layer
        this.#map.removeLayer(layerWrapper.getLayer());

        window.dispatchEvent(new CustomEvent(Events.custom.mapLayerRemoved, {
            detail: {
                layerWrapper: layerWrapper, 
                silent: silent
            }
        }));
    }

    static getMapLayers() {
        return this.#layers.mapLayers;
    }

    static getMapLayerById(id) {
        // Note: The id is a string UUID
        const result = this.#layers.mapLayers.find((layerWrapper) => {
            return layerWrapper.getId() === id;
        });

        return result;
    }

    static getOlMapLayers() {
        const layers = [];

        // Filter out the actual ol layer
        for(let index in this.#layers.mapLayers) {
            layers.push(this.#layers.mapLayers[index].getLayer());
        }

        return layers;
    }

    static setTopMapLayerAsOnlyVisible() {
        this.#layers.mapLayers.forEach((layerWrapper) => {
            layerWrapper.getLayer().setVisible(false);
        });
    
        if(!this.isMapLayersEmpty()) {
            this.#layers.mapLayers[0].getLayer().setVisible(true);
        }
    }

    static getMapLayerSize() {
        return this.#layers.mapLayers.length;
    }

    static isMapLayersEmpty() {
        return this.getMapLayerSize() === 0;
    }

    static setMapLayerZIndex(layerId, index) {
        const layerWrapper = this.getMapLayerById(layerId);
        layerWrapper.getLayer().setZIndex(ZINDEX_BASE_MAP_LAYER + index);
    }

    //-------------------------------------------
    // Feature layers specific
    //-------------------------------------------

    static addFeatureLayer(options = {}) {
        const mergedOptions = { ...DefaultFeatureLayerOptions, ...options };
        mergedOptions.name = this.#validateName(mergedOptions.name);
        LogManager.logDebug(FILENAME, 'addFeatureLayer', mergedOptions.name);

        const layerWrapper = {
            id: mergedOptions.id,
            name: mergedOptions.name,
            layer: new VectorLayer({
                source: new VectorSource(),
                visible: mergedOptions.visible
            })
        };

        this.#addPropertiesInterface(layerWrapper);

        if(!layerWrapper.getId()) {
            const layerId = uuidv4();
            layerWrapper.setId(layerId);
        }

        this.#activeFeatureLayer = layerWrapper;

        if(this.#map) {
            this.#addFeatureLayerToMap(layerWrapper, mergedOptions);
        }else {
            this.#queue.featureLayers.push({
                layerWrapper: layerWrapper, 
                options: mergedOptions
            });
        }

        return layerWrapper;
    }

    static #addFeatureLayerToMap(layerWrapper, options) {
        this.#layers.featureLayers.push(layerWrapper);
        this.#map.addLayer(layerWrapper.getLayer());

        window.dispatchEvent(new CustomEvent(Events.custom.featureLayerAdded, {
            detail: {
                layerWrapper: layerWrapper, 
                silent: options.silent,
                disableFeatureLayerVisibilityButton: options.disableFeatureLayerVisibilityButton,
                disableFeatureLayerEditButton: options.disableFeatureLayerEditButton,
                disableFeatureLayerDownloadButton: options.disableFeatureLayerDownloadButton,
                disableFeatureLayerDeleteButton: options.disableFeatureLayerDeleteButton,
            }
        }));
    }

    static #getNextActiveFeatureLayer() {
        return (!this.isFeatureLayersEmpty() 
            ? this.#layers.featureLayers[this.#layers.featureLayers.length - 1] 
            : null
        );
    }

    static removeFeatureLayer(layerWrapper, silent = false) {
        LogManager.logDebug(FILENAME, 'removeFeatureLayer', layerWrapper.getName());

        // Remove the layer from the internal collection
        this.#layers.featureLayers = this.#layers.featureLayers.filter((layer) => {
            return layer.getId() !== layerWrapper.getId();
        }); 

        const layer = layerWrapper.getLayer();
        
        // Remove overlays associated with each feature
        layer.getSource().getFeatures().forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FeatureProperties.tooltip)) {
                this.#map.removeOverlay(feature.getProperties().oltb.tooltip);
            }
        });

        // Remove the actual ol layer
        this.#map.removeLayer(layer);

        // Sett another layer as active if exists
        this.#activeFeatureLayer = this.#getNextActiveFeatureLayer();

        window.dispatchEvent(new CustomEvent(Events.custom.featureLayerRemoved, {
            detail: {
                layerWrapper: layerWrapper, 
                silent: silent
            }
        }));
    }

    static getActiveFeatureLayer(options = {}) {
        if(!this.#activeFeatureLayer) {
            this.addFeatureLayer({
                name: options.fallback
            });
        }

        return this.#activeFeatureLayer;
    }

    static setActiveFeatureLayer(layer) {
        this.#activeFeatureLayer = layer;
    }

    static getFeatureLayers() {
        return this.#layers.featureLayers;
    }

    static getFeatureLayerById(id) {
        // Note: The id is a string UUID
        const result = this.#layers.featureLayers.find((layerWrapper) => {
            return layerWrapper.getId() === id;
        });

        return result;
    }

    static removeFeatureFromLayer(feature) {
        this.getFeatureLayers().forEach((layerWrapper) => {
            layerWrapper.getLayer().getSource().removeFeature(feature);
        });
    }

    static getFeatureLayerSize() {
        return this.#layers.featureLayers.length;
    }

    static isFeatureLayersEmpty() {
        return this.getFeatureLayerSize() === 0;
    }

    static setFeatureLayerZIndex(layerId, index) {
        const layerWrapper = this.getFeatureLayerById(layerId);
        layerWrapper.getLayer().setZIndex(ZINDEX_BASE_FEATURE_LAYER + index);
    }
}

export { LayerManager };
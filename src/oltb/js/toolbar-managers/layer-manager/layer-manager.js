import _ from 'lodash';
import { Toast } from '../../ui-common/ui-toasts/toast';
import { Events } from '../../browser-constants/events';
import { Collection } from 'ol';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { v4 as uuidv4 } from 'uuid';
import { StyleManager } from '../style-manager/style-manager';
import { EventManager } from '../event-manager/event-manager';
import { FeatureManager } from '../feature-manager/feature-manager';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

const FILENAME = 'layer-manager.js';
const DEFAULT__LAYER_NAME = 'New layer';
const ZINDEX__BASE_MAP_LAYER = 1;
const ZINDEX__BASE_FEATURE_LAYER = 1e6;

const DefaultFeatureLayerOptions = Object.freeze({
    name: '',
    isVisible: true,
    isSilent: false,
    disableFeatureLayerEditButton: false,
    disableFeatureLayerDownloadButton: false,
    disableFeatureLayerDeleteButton: false
});

const DefaultMapLayerOptions = Object.freeze({
    isVisible: true,
    isSilent: false,
    disableMapLayerEditButton: false,
    disableMapLayerDeleteButton: false
});

/**
 * About:
 * LayerManager
 * 
 * Description:
 * Manages all Map- and Feature layers as well as all added features that are tracked by the SnapManager.
 */
class LayerManager extends BaseManager {
    static #map;
    static #activeFeatureLayer;

    // Note: 
    // When using Snap interaction
    // Option 1: Using a dedicated source, not optimal, thus it is hard to know what layer each drawn feature belongs to
    // There is an event that always sets the active feature layer to the targeted source for the Snap interaction
    // Option 2: A collection of features, but requires some work to keep this collection updated
    // The LayerManager must be the single point of adding/removing features from a layer, or the layer must be observed
    static #snapFeatures = new Collection();

    static #queue = {
        mapLayers: [],
        featureLayers: []
    };

    static #layers = {
        mapLayers: [],
        featureLayers: []
    };

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) { 
        LogManager.logDebug(FILENAME, 'setMap', {
            info: 'Handling map-queues for layers that were added before the map was ready',
            adding: {
                mapLayers: this.#queue.mapLayers.length,
                featureLayers: this.#queue.featureLayers.length
            }
        });

        this.#map = map;

        this.#handleMapLayerQueue();
        this.#handleFeatureLayerQueue();
    }

    static getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // Section: Init
    //--------------------------------------------------------------------
    static #handleMapLayerQueue() {
        this.#queue.mapLayers.forEach((item) => {
            this.#addMapLayerToMap(item.layerWrapper, item.options);
        });

        this.#queue.mapLayers = [];
    }

    static #handleFeatureLayerQueue() {
        this.#queue.featureLayers.forEach((item) => {
            this.#addFeatureLayerToMap(item.layerWrapper, item.options);
        });

        this.#queue.featureLayers = [];
    }

    //--------------------------------------------------------------------
    // Section: Internal
    //--------------------------------------------------------------------
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
            name = DEFAULT__LAYER_NAME;
        }

        return name;
    }

    static #getLayerWrapperFromFeature(target, layers) {
        for(let i = 0; i < layers.length; i++) {
            const layerWrapper = layers[i];
            const layer = layerWrapper.getLayer();

            // Note:
            // Only vector layers can have features
            if(!this.isVectorLayer(layer)) {
                continue;
            }

            const source = layer.getSource();
            const features = source.getFeatures();

            for(let j = 0; j < features.length; j++) {
                if(target === features[j]) {
                    return layerWrapper;
                }
            }
        }

        return undefined
    }

    static #removeLayerFromMap(layerWrapper) {
        this.#map.removeLayer(layerWrapper.getLayer());
    }

    static #handleFeatureOverlays(feature, layerWrapper) {
        const layer = layerWrapper.getLayer();
        const tooltip = FeatureManager.getTooltip(feature);

        if(!tooltip) {
            return;
        }

        if(layer.getVisible()) {
            tooltip.setMap(this.#map);
        }else {
            tooltip.setMap(null);
        }
    }

    //--------------------------------------------------------------------
    // Section: Common Layers
    //--------------------------------------------------------------------
    static addFeatureToLayer(feature, layerWrapper, i18nKey) {
        const layer = layerWrapper.getLayer();
        const source = layer.getSource();

        if(FeatureManager.hasTooltip(feature)) {
            this.#map.addOverlay(FeatureManager.getTooltip(feature));
        }

        source.addFeature(feature);
        this.#snapFeatures.push(feature);
        this.#handleFeatureOverlays(feature, layerWrapper);

        if(i18nKey && !layer.getVisible()) {
            Toast.info({
                i18nKey: i18nKey, 
                autoremove: true
            });
        }
    }

    static removeFeatureFromLayer(feature, layerWrapper) {
        const layer = layerWrapper.getLayer();
        const source = layer.getSource();

        if(FeatureManager.hasTooltip(feature)) {
            this.#map.removeOverlay(FeatureManager.getTooltip(feature));
        }

        source.removeFeature(feature);
        this.#snapFeatures.remove(feature);
    }

    static getSnapFeatures() {
        return this.#snapFeatures;
    }

    static clearSnapFeatures() {
        this.#snapFeatures = new Collection();
    }

    static isVectorLayer(layer) {
        return layer instanceof VectorLayer;
    }

    static isVectorSource(source) {
        return source instanceof VectorSource;
    }

    static getLayerFromFeature(feature) {
        const layerWrapper = this.getLayerWrapperFromFeature(feature);

        if(layerWrapper) {
            return layerWrapper.getLayer();
        }

        return undefined;
    }

    static getLayerWrapperFromFeature(feature) {
        let result = undefined;

        result = this.#getLayerWrapperFromFeature(feature, this.#layers.mapLayers);
        
        // Note:
        // The layer was found in the MapLayers, no need to look in the FeatureLayers
        if(result) {
            return result;
        }

        result = this.#getLayerWrapperFromFeature(feature, this.#layers.featureLayers);

        return result;
    }

    //--------------------------------------------------------------------
    // Section: Map Layers Specific
    //--------------------------------------------------------------------
    static #removeMapLayerFromInternal(layerWrapper) {
        this.#layers.mapLayers = this.#layers.mapLayers.filter((layer) => {
            return layer.getId() !== layerWrapper.getId();
        });
    }

    static #removeMapOverlaysAndSnapFromInternal(layerWrapper) {
        const layer = layerWrapper.getLayer();
        if(this.isVectorLayer(layer)) {
            layer.getSource().getFeatures().forEach((feature) => {
                this.#snapFeatures.remove(feature);
            });
        }
    }

    static #addMapLayerToMap(layerWrapper, options) {
        this.#layers.mapLayers.push(layerWrapper);
        this.#map.addLayer(layerWrapper.getLayer());

        EventManager.dispatchCustomEvent([window], Events.custom.mapLayerAdded, {
            detail: {
                layerWrapper: layerWrapper, 
                isSilent: options.isSilent,
                disableMapLayerEditButton: options.disableMapLayerEditButton,
                disableMapLayerDeleteButton: options.disableMapLayerDeleteButton
            }
        });
    }

    static addMapLayers(layerWrappers, options = {}) {
        for(let index in layerWrappers) {
            this.addMapLayer(layerWrappers[index], options);
        }
    }

    static addMapLayer(layerWrapper, options = {}) {
        const mergedOptions = _.merge(_.cloneDeep(DefaultMapLayerOptions), options);
        layerWrapper.name = this.#validateName(layerWrapper.name);
        
        LogManager.logDebug(FILENAME, 'addMapLayer', layerWrapper.name);

        this.#addPropertiesInterface(layerWrapper);

        if(!layerWrapper.isDynamicallyAdded) {
            layerWrapper.isDynamicallyAdded = false;
        }

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

        return layerWrapper;
    }

    static removeAllMapLayers() {
        this.#layers.mapLayers.forEach((layerWrapper) => {
            this.removeMapLayer(layerWrapper);
        });
    }

    static removeMapLayer(layerWrapper, isSilent = false) {
        LogManager.logDebug(FILENAME, 'removeMapLayer', layerWrapper.getName());

        this.#removeMapLayerFromInternal(layerWrapper);
        this.#removeMapOverlaysAndSnapFromInternal(layerWrapper);
        this.#removeLayerFromMap(layerWrapper);

        EventManager.dispatchCustomEvent([window], Events.custom.mapLayerRemoved, {
            detail: {
                layerWrapper: layerWrapper, 
                isSilent: isSilent
            }
        });
    }

    static hasMapLayerWithId(id) {
        return !!this.getMapLayerById(id);
    }

    static getMapLayers() {
        return this.#layers.mapLayers;
    }

    static getMapLayerById(id) {
        return this.#layers.mapLayers.find((layerWrapper) => {
            return layerWrapper.getId() === id;
        });
    }

    static getOLMapLayers() {
        const layers = [];
        
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
        layerWrapper.getLayer().setZIndex(ZINDEX__BASE_MAP_LAYER + index);
    }

    static belongsToMapLayer(feature) {
        return !!this.#layers.mapLayers.find((layerWrapper) => {
            return (
                layerWrapper.getLayer().getSource().hasFeature !== undefined &&
                layerWrapper.getLayer().getSource().hasFeature(feature)
            );
        });
    }

    //--------------------------------------------------------------------
    // Section: Feature Layers Specific
    //--------------------------------------------------------------------
    static #removeFeatureLayerFromInternal(layerWrapper) {
        this.#layers.featureLayers = this.#layers.featureLayers.filter((layer) => {
            return layer.getId() !== layerWrapper.getId();
        });
    }

    static #removeFeatureOverlaysAndSnapFromInternal(layerWrapper) {
        layerWrapper.getLayer().getSource().getFeatures().forEach((feature) => {
            this.#snapFeatures.remove(feature);

            if(FeatureManager.hasTooltip(feature)) {
                this.#map.removeOverlay(FeatureManager.getTooltip(feature));
            }
        });
    }

    static #addFeatureLayerToMap(layerWrapper, options) {
        this.#layers.featureLayers.push(layerWrapper);
        this.#map.addLayer(layerWrapper.getLayer());

        EventManager.dispatchCustomEvent([window], Events.custom.featureLayerAdded, {
            detail: {
                layerWrapper: layerWrapper, 
                isSilent: options.isSilent,
                disableFeatureLayerEditButton: options.disableFeatureLayerEditButton,
                disableFeatureLayerDownloadButton: options.disableFeatureLayerDownloadButton,
                disableFeatureLayerDeleteButton: options.disableFeatureLayerDeleteButton,
            }
        });
    }

    static #getNextActiveFeatureLayer() {
        if(this.isFeatureLayersEmpty()) {
            return null;
        }

        return this.#layers.featureLayers[this.#layers.featureLayers.length - 1];
    }

    static addFeatureLayer(options = {}) {
        const mergedOptions = _.merge(_.cloneDeep(DefaultFeatureLayerOptions), options);
        mergedOptions.name = this.#validateName(mergedOptions.name);

        LogManager.logDebug(FILENAME, 'addFeatureLayer', mergedOptions.name);

        // Note:
        // Previously the styles for both IconMarkers and WindBarbs was generated
        // in each of the Generator-function. By using the vector-style-function
        // the render process can be better controlled and more effective.
        const layerWrapper = {
            id: mergedOptions.id,
            name: mergedOptions.name,
            sortIndex: mergedOptions.sortIndex,
            isDynamicallyAdded: mergedOptions.isDynamicallyAdded,
            layer: new VectorLayer({
                source: new VectorSource(),
                visible: mergedOptions.isVisible,
                style: function(feature, resolution) {
                    return StyleManager.getStyle(feature, resolution);
                }
            })
        };

        this.#addPropertiesInterface(layerWrapper);

        if(!layerWrapper.isDynamicallyAdded) {
            layerWrapper.isDynamicallyAdded = false;
        }

        if(!layerWrapper.getId()) {
            const layerId = uuidv4();
            layerWrapper.setId(layerId);
        }

        this.setActiveFeatureLayer(layerWrapper);

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

    static removeAllFeatureLayers() {
        this.#layers.featureLayers.forEach((layerWrapper) => {
            this.removeFeatureLayer(layerWrapper);
        });
    }

    static removeFeatureLayer(layerWrapper, isSilent = false) {
        LogManager.logDebug(FILENAME, 'removeFeatureLayer', layerWrapper.getName());

        this.#removeFeatureLayerFromInternal(layerWrapper);
        this.#removeFeatureOverlaysAndSnapFromInternal(layerWrapper);
        this.#removeLayerFromMap(layerWrapper);

        this.setNextActiveFeatureLayer();

        EventManager.dispatchCustomEvent([window], Events.custom.featureLayerRemoved, {
            detail: {
                layerWrapper: layerWrapper, 
                isSilent: isSilent
            }
        });
    }

    static getActiveFeatureLayer(options = {}) {
        if(!this.#activeFeatureLayer) {
            this.addFeatureLayer({
                name: options.fallback,
                isDynamicallyAdded: true
            });
        }

        return this.#activeFeatureLayer;
    }

    static setNextActiveFeatureLayer() {
        const nextLayer = this.#getNextActiveFeatureLayer();
        this.setActiveFeatureLayer(nextLayer);
    }

    static setActiveFeatureLayer(layerWrapper) {
        this.#activeFeatureLayer = layerWrapper;

        EventManager.dispatchCustomEvent([window], Events.custom.activeFeatureLayerChange, {
            detail: {
                layerWrapper: layerWrapper
            }
        });
    }

    static hasFeatureLayerWithId(id) {
        return !!this.getFeatureLayerById(id);
    }

    static getFeatureLayers() {
        return this.#layers.featureLayers;
    }

    static getFeatureLayerById(id) {
        return this.#layers.featureLayers.find((layerWrapper) => {
            return layerWrapper.getId() === id;
        });
    }

    static removeFeatureFromFeatureLayers(feature) {
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
        layerWrapper.getLayer().setZIndex(ZINDEX__BASE_FEATURE_LAYER + index);
    }

    static belongsToFeatureLayer(feature) {
        return !!this.#layers.featureLayers.find((layerWrapper) => {
            return (
                layerWrapper.getLayer().getSource().hasFeature !== undefined &&
                layerWrapper.getLayer().getSource().hasFeature(feature)
            );
        });
    }
}

export { LayerManager };
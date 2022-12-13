import VectorLayer from 'ol/layer/Vector'; 
import VectorSource from 'ol/source/Vector';
import { EVENTS } from '../../helpers/constants/Events';
import { FEATURE_PROPERTIES } from '../../helpers/constants/FeatureProperties';
import { hasCustomFeatureProperty } from '../../helpers/browser/HasNestedProperty';

const DEFAULT_LAYER_NAME = 'New layer';
const ZINDEX_BASE = 1000;

class LayerManager {
    static #map;
    static #activeFeatureLayer;
    static #layerId = 0;

    static #queue = {
        mapLayers: [],
        featureLayers: []
    };

    static #layers = {
        mapLayers: [],
        featureLayers: []
    };

    static init(map) {
        if(this.#map) {
            return;
        }

        this.#map = map;

        // Handle queue of map-layers that was added before the map was ready
        this.#queue.mapLayers.forEach((item) => {
            this.addMapLayerToMap(item.layerWrapper, item.silent);
        });

        this.#queue.mapLayers = [];

        // Handle queue of feature-layers that was added before the map was ready
        this.#queue.featureLayers.forEach((item) => {
            this.addFeatureLayerToMap(item.layerWrapper, item.silent);
        });

        this.#queue.featureLayers = [];
    }

    //-------------------------------------------
    // Map layers specific
    //-------------------------------------------
    static addMapLayers(layerWrappers, silent = false) {
        for(let index in layerWrappers) {
            this.addMapLayer(layerWrappers[index], silent);
        }
    }

    static addMapLayer(layerWrapper, silent = false) {
        layerWrapper.id = this.#layerId;
        this.#layerId = this.#layerId + 1;
    
        if(this.#map) {
            this.addMapLayerToMap(layerWrapper, silent);
        }else {
            this.#queue.mapLayers.push({layerWrapper: layerWrapper, silent: silent});
        }
    }

    static addMapLayerToMap(layerWrapper, silent = false) {
        this.#layers.mapLayers.push(layerWrapper);
        this.#map.addLayer(layerWrapper.layer);
            
        // Dispatch event, the layer-tool updates the UI
        window.dispatchEvent(new CustomEvent(EVENTS.custom.mapLayerAdded, {
            detail: {
                layerWrapper: layerWrapper, 
                silent: silent
            }
        }));
    }

    static removeMapLayer(targetLayer, silent = false) {
        // Remove the layer from the internal collection
        this.#layers.mapLayers = this.#layers.mapLayers.filter(function(layer) {
            return layer.id !== targetLayer.id;
        }); 

        // Remove the actual ol layer
        this.#map.removeLayer(targetLayer.layer);

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent(EVENTS.custom.mapLayerRemoved, {
            detail: {
                layerWrapper: targetLayer, 
                silent: silent
            }
        }));
    }

    static getMapLayers() {
        return this.#layers.mapLayers;
    }

    static getMapLayerById(id) {
        const result = this.#layers.mapLayers.find((layerWrapper) => {
            return layerWrapper.id === id;
        });

        return result;
    }

    static getOlMapLayers() {
        const olLayers = [];

        // Filter out the actual ol layer
        for(let index in this.#layers.mapLayers) {
            olLayers.push(this.#layers.mapLayers[index].layer);
        }

        return olLayers;
    }

    static setTopMapLayerAsOnlyVisible() {
        this.#layers.mapLayers.forEach((layerWrapper) => {
            layerWrapper.layer.setVisible(false);
        });
    
        if(!this.isMapLayersEmpty()) {
            this.#layers.mapLayers[0].layer.setVisible(true);
        }
    }

    static getMapLayerSize() {
        return this.#layers.mapLayers.length;
    }

    static isMapLayersEmpty() {
        return this.getMapLayerSize() === 0;
    }

    //-------------------------------------------
    // Feature layers specific
    //-------------------------------------------
    static addFeatureLayer(name, visible = true, silent = false) {
        name = name.trim();

        if(!name.length) {
            name = DEFAULT_LAYER_NAME;
        }

        const layerWrapper = {
            id: this.#layerId,
            name: name,
            layer: new VectorLayer({
                source: new VectorSource(),
                zIndex: ZINDEX_BASE + this.#layerId,
                visible: visible
            })
        };

        this.#layerId = this.#layerId + 1;
        this.#activeFeatureLayer = layerWrapper;

        if(this.#map) {
            this.addFeatureLayerToMap(layerWrapper, silent);
        }else {
            this.#queue.featureLayers.push({layerWrapper: layerWrapper, silent: silent});
        }

        return layerWrapper;
    }

    static addFeatureLayerToMap(layerWrapper, silent = false) {
        this.#layers.featureLayers.push(layerWrapper);
        this.#map.addLayer(layerWrapper.layer);

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent(EVENTS.custom.featureLayerAdded, {
            detail: {
                layerWrapper: layerWrapper, 
                silent: silent
            }
        }));
    }

    static removeFeatureLayer(targetLayer, silent = false) {
        // Remove the layer from the internal collection
        this.#layers.featureLayers = this.#layers.featureLayers.filter(function(layer) {
            return layer.id !== targetLayer.id;
        }); 

        // Remove overlays associated with each feature
        targetLayer.layer.getSource().getFeatures().forEach((feature) => {
            if(hasCustomFeatureProperty(feature.getProperties(), FEATURE_PROPERTIES.tooltip)) {
                this.#map.removeOverlay(feature.getProperties().oltb.tooltip);
            }
        });

        // Remove the actual ol layer
        this.#map.removeLayer(targetLayer.layer);

        // Sett another layer as active if exists
        this.#activeFeatureLayer = !this.isFeatureLayersEmpty() 
            ? this.#layers.featureLayers[this.#layers.featureLayers.length - 1] 
            : null;

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent(EVENTS.custom.featureLayerRemoved, {
            detail: {
                layerWrapper: targetLayer, 
                silent: silent
            }
        }));
    }

    static getActiveFeatureLayer(options = {}) {
        if(!this.#activeFeatureLayer) {
            this.addFeatureLayer(options.fallback);
        }

        return this.#activeFeatureLayer;
    }

    static setActiveFeatureLayer(layer) {
        this.#activeFeatureLayer = layer;
    }

    static getFeatureLayers() {
        return this.#layers.featureLayers;
    }

    static removeFeatureFromLayer(feature) {
        this.getFeatureLayers().forEach((layerWrapper) => {
            layerWrapper.layer.getSource().removeFeature(feature);
        });
    }

    static getFeatureLayerSize() {
        return this.#layers.featureLayers.length;
    }

    static isFeatureLayersEmpty() {
        return this.getFeatureLayerSize() === 0;
    }
}

export default LayerManager;
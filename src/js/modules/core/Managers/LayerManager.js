import { Vector as VectorLayer } from 'ol/layer'; 
import { Vector as VectorSource } from 'ol/source';
import { hasNestedProperty } from '../../helpers/HasNestedProperty';

const DEFAULT_LAYER_NAME = 'New layer';
const ZINDEX_BASE = 1000;

class LayerManager {
    static map;
    static activeFeatureLayer;
    static layerId = 0;

    static queue = {
        mapLayers: [],
        featureLayers: []
    };

    static layers = {
        mapLayers: [],
        featureLayers: []
    };

    static init(map) {
        if(this.map) {
            return;
        }

        this.map = map;

        // Handle queue of layers that was added before the map was ready
        this.queue.mapLayers.forEach((item) => {
            this.addMapLayerToMap(item.layerWrapper, item.isSilent);
        });

        this.queue.mapLayers = [];

        this.queue.featureLayers.forEach((item) => {
            this.addFeatureLayerToMap(item.layerWrapper, item.isSilent);
        });

        this.queue.featureLayers = [];
    }

    //-------------------------------------------
    // Map layers
    //-------------------------------------------
    static addMapLayers(layerWrappers, isSilent = false) {
        for(let index in layerWrappers) {
            this.addMapLayer(layerWrappers[index], isSilent);
        }
    }

    static addMapLayer(layerWrapper, isSilent = false) {
        layerWrapper.id = this.layerId;
        this.layerId = this.layerId + 1;
    
        if(this.map) {
            this.addMapLayerToMap(layerWrapper, isSilent);
        }else {
            this.queue.mapLayers.push({layerWrapper: layerWrapper, isSilent: isSilent});
        }
    }

    static addMapLayerToMap(layerWrapper, isSilent = false) {
        this.layers.mapLayers.push(layerWrapper);
        this.map.addLayer(layerWrapper.layer);
            
        // Dispatch event, the layer-tool updates the UI
        window.dispatchEvent(new CustomEvent('oltb.mapLayer.added', {
            detail: {
                layerWrapper: layerWrapper, 
                isSilent: isSilent
            }
        }));
    }

    static removeMapLayer(targetLayer, isSilent = false) {
        // Remove the layer from the internal collection
        this.layers.mapLayers = this.layers.mapLayers.filter(function(layer) {
            return layer.id !== targetLayer.id;
        }); 

        // Remove the actual ol layer
        this.map.removeLayer(targetLayer.layer);

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent('oltb.mapLayer.removed', {
            detail: {
                layerWrapper: targetLayer, 
                isSilent: isSilent
            }
        }));
    }

    static getMapLayers() {
        return this.layers.mapLayers;
    }

    static getMapLayerById(id) {
        const result = this.layers.mapLayers.find((layerWrapper) => {
            return layerWrapper.id === id;
        });

        return result;
    }

    static getOLMapLayers() {
        const olLayers = [];

        // Filter out the actual ol-layer
        for(let index in this.layers.mapLayers) {
            olLayers.push(this.layers.mapLayers[index].layer);
        }

        return olLayers;
    }

    static setTopMapLayerAsOnlyVisible() {
        this.layers.mapLayers.forEach((layerWrapper) => {
            layerWrapper.layer.setVisible(false);
        });
    
        if(!this.isMapLayersEmpty()) {
            this.layers.mapLayers[0].layer.setVisible(true);
        }
    }

    static getMapLayerSize() {
        return this.layers.mapLayers.length;
    }

    static isMapLayersEmpty() {
        return this.getMapLayerSize() === 0;
    }

    //-------------------------------------------
    // Feature layers
    //-------------------------------------------
    static addFeatureLayer(name, isSilent = false) {
        name = name.trim();

        if(!name.length) {
            name = DEFAULT_LAYER_NAME;
        }

        const layerWrapper = {
            id: this.layerId,
            name: name,
            layer: new VectorLayer({
                source: new VectorSource(),
                zIndex: ZINDEX_BASE + this.layerId
            })
        };

        this.layerId = this.layerId + 1;
        this.activeFeatureLayer = layerWrapper;

        if(this.map) {
            this.addFeatureLayerToMap(layerWrapper, isSilent);
        }else {
            this.queue.featureLayers.push({layerWrapper: layerWrapper, isSilent: isSilent});
        }

        return layerWrapper;
    }

    static addFeatureLayerToMap(layerWrapper, isSilent = false) {
        this.layers.featureLayers.push(layerWrapper);
        this.map.addLayer(layerWrapper.layer);

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent('oltb.featureLayer.added', {
            detail: {
                layerWrapper: layerWrapper, 
                isSilent: isSilent
            }
        }));
    }

    static removeFeatureLayer(targetLayer, isSilent = false) {
         // Remove the layer from the internal collection
        this.layers.featureLayers = this.layers.featureLayers.filter(function(layer) {
            return layer.id !== targetLayer.id;
        }); 

        // Remove potential overlays associated with each feature
        targetLayer.layer.getSource().getFeatures().forEach((feature) => {
            if(hasNestedProperty(feature.getProperties(), 'tooltipOverlay')) {
                this.map.removeOverlay(feature.getProperties().tooltipOverlay);
            }
        });

        // Remove the actual ol layer
        this.map.removeLayer(targetLayer.layer);

        // Sett another layer as active if exists
        this.activeFeatureLayer = !this.isFeatureLayersEmpty() 
            ? this.layers.featureLayers[this.layers.featureLayers.length - 1] 
            : null;

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent('oltb.featureLayer.removed', {
            detail: {
                layerWrapper: targetLayer, 
                isSilent: isSilent
            }
        }));
    }

    static getActiveFeatureLayer(options = {}) {
        if(!this.activeFeatureLayer) {
            this.addFeatureLayer(options.fallback);
        }

        return this.activeFeatureLayer;
    }

    static setActiveFeatureLayer(layer) {
        this.activeFeatureLayer = layer;
    }

    static getFeatureLayers() {
        return this.layers.featureLayers;
    }

    static removeFeatureFromLayer(feature) {
        const partner = feature?.getProperties()?.partner;

        this.getFeatureLayers().forEach((layerWrapper) => {
            const source = layerWrapper.layer.getSource();

            feature && source.removeFeature(feature);
            partner && source.removeFeature(partner);
        });
    }

    static getFeatureLayerSize() {
        return this.layers.featureLayers.length;
    }

    static isFeatureLayersEmpty() {
        return this.getFeatureLayerSize() === 0;
    }
}

export default LayerManager;
import { Vector as VectorLayer } from 'ol/layer'; 
import { Vector as VectorSource } from 'ol/source';

class LayerManager {
    static map;
    static defaultLayerName = 'New layer';
    static layers = {
        mapLayers: [],
        featureLayers: []
    };

    static activeFeatureLayer = this.layers.featureLayers[0];
    static layerIdCounter = 0;
    static featureLayerZIndexBase = 10000;

    static init(mapReference) {
        if(!this.map) {
            this.map = mapReference;
        }
    }

    //-------------------------------------------
    // Map layers
    //-------------------------------------------
    static addMapLayers(layerObjects, silent = false) {
        for(let index in layerObjects) {
            this.addMapLayer(layerObjects[index], silent);
        }
    }

    static addMapLayer(layerObject, silent = false) {
        // Add unique id parameter to the layer
        layerObject.id = this.layerIdCounter;
        this.layerIdCounter++;
    
        // Store layer internally
        this.layers.mapLayers.push(layerObject);
    
        // Add the layer to the map
        this.map.addLayer(layerObject.layer);
    
        // Dispatch event, the layer-tool updates the UI
        window.dispatchEvent(new CustomEvent('oltb.mapLayer.added', {
            detail: {
                layerObject: layerObject, 
                silent: silent
            }
        }));
    }

    static removeMapLayer(targetLayer, silent = false) {
        // Remove the layer from the internal layermanager datastructure
        this.layers.mapLayers = this.layers.mapLayers.filter(function(layer) {
            return layer.id !== targetLayer.id;
        }); 

        // Remove layer from map
        this.map.removeLayer(targetLayer.layer);

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent('oltb.mapLayer.removed', {
            detail: {
                layerObject: targetLayer, 
                silent: silent
            }
        }));
    }

    static getMapLayers() {
        return this.layers.mapLayers;
    }

    static getMapLayerById(id) {
        const result = this.layers.mapLayers.find(layerObject => {
            return layerObject.id === id;
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
        this.layers.mapLayers.forEach(layerObject => {
            layerObject.layer.setVisible(false);
        });
    
        if(!this.isMapLayersEmpty()) {
            this.layers.mapLayers[0].layer.setVisible(true);
        }
    }

    static isMapLayersEmpty() {
        return this.getMapLayerSize() === 0;
    }

    static getMapLayerSize() {
        return this.layers.mapLayers.length;
    }

    //-------------------------------------------
    // Feature layers
    //-------------------------------------------
    static addFeatureLayer(name = this.defaultLayerName, silent = false) {
        name = name.trim();
    
        // Fall back to the default namne if no name is entered
        if(!name.length) {
            name = this.defaultLayerName;
        }

        const layerObject = {
            id: this.layerIdCounter,
            name: name,
            layer: new VectorLayer({
                source: new VectorSource(),
                zIndex: this.featureLayerZIndexBase + this.layerIdCounter
            })
        };

        this.layerIdCounter++;
        this.activeFeatureLayer = layerObject;

        // Store layer internally
        this.layers.featureLayers.push(layerObject);

        // Add the layer to the map
        this.map.addLayer(layerObject.layer);

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent('oltb.featureLayer.added', {
            detail: {
                layerObject: layerObject, 
                silent: silent
            }
        }));
    }

    static removeFeatureLayer(targetLayer, silent = false) {
        // Remove the layer from the internal layermanager datastructure
        this.layers.featureLayers = this.layers.featureLayers.filter(function(layer) {
            return layer.id !== targetLayer.id;
        }); 

        // Remove potential overlays associated with each feature
        targetLayer.layer.getSource().getFeatures().forEach(feature => {
            if('properties' in feature && 'tooltipOverlay' in feature.properties) {
                this.map.removeOverlay(feature.properties.tooltipOverlay);
            }
        });

        // Remove layer from map
        this.map.removeLayer(targetLayer.layer);

        // Sett another layer as active if exists
        this.activeFeatureLayer = !this.isFeatureLayersEmpty() 
            ? this.layers.featureLayers[this.layers.featureLayers.length - 1] 
            : null;

        // Dispatch event, the layer-tool, updates the UI
        window.dispatchEvent(new CustomEvent('oltb.featureLayer.removed', {
            detail: {
                layerObject: targetLayer, 
                silent: silent
            }
        }));
    }

    static getActiveFeatureLayer(options = {}) {
        if(!this.activeFeatureLayer) {
            this.addFeatureLayer(options.ifNoLayerName);
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
        const linkedFeature = feature?.properties?.linkedFeature;
        
        this.getFeatureLayers().forEach(layerObject => {
            layerObject.layer.getSource().removeFeature(feature);

            if(linkedFeature) {
                layerObject.layer.getSource().removeFeature(linkedFeature);
            }
        });
    }

    static isFeatureLayersEmpty() {
        return this.getFeatureLayerSize() === 0;
    }

    static getFeatureLayerSize() {
        return this.layers.featureLayers.length;
    }
}

export default LayerManager;
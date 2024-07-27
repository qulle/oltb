import { jest, describe, it, expect } from '@jest/globals';
import { LayerManager } from './layer-manager';
import { validate as isValidUUID } from 'uuid';

const FILENAME = 'layer-manager.js';

describe('LayerManager', () => {
    it('should init the manager', async () => {
        return LayerManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spy = jest.spyOn(LayerManager, 'setMap');
        const map = {
            addLayer: (layer) => {},
            removeLayer: (layer) => {}
        };

        LayerManager.setMap(map);
        expect(spy).toHaveBeenCalled();
        expect(LayerManager.getName()).toBe(FILENAME);
    });

    it('should create map-layer', () => {
        const options = {};
        const layerWrapper = {
            name: 'Jest',
            id: '4be8f4c6-bfa5-425a-9b46-7105dc18fa3a'
        };
        
        LayerManager.addMapLayer(layerWrapper, options);

        expect(isValidUUID(layerWrapper.getId())).toBe(true);
        expect(layerWrapper.getName()).toBe('Jest');

        expect(LayerManager.getMapLayerSize()).toBe(1);
        expect(LayerManager.getOLMapLayers().length).toBe(1);
        expect(LayerManager.isMapLayersEmpty()).toBe(false);
        expect(LayerManager.hasMapLayerWithId(layerWrapper.getId())).toBe(true);
        expect(LayerManager.getMapLayers()).toStrictEqual([layerWrapper]);

        ['getLayer', 'setLayer', 'getName', 'setName', 'getId', 'setId'].forEach((prop) => {
            expect(layerWrapper).toHaveProperty(prop);
        });
    });

    it('should create feature-layer', () => {
        const options = {name: 'Jest'};
        const layerWrapper = LayerManager.addFeatureLayer(options);

        expect(layerWrapper).toBeTruthy();
        expect(isValidUUID(layerWrapper.getId())).toBe(true);
        expect(layerWrapper.getName()).toBe('Jest');

        expect(LayerManager.getFeatureLayerSize()).toBe(1);
        expect(LayerManager.isFeatureLayersEmpty()).toBe(false);
        expect(LayerManager.getActiveFeatureLayer()).toStrictEqual(layerWrapper);
        expect(LayerManager.hasFeatureLayerWithId(layerWrapper.getId())).toBe(true);
        expect(LayerManager.getFeatureLayers()).toStrictEqual([layerWrapper]);

        expect(LayerManager.isVectorLayer(layerWrapper.getLayer())).toBe(true);
        expect(LayerManager.isVectorSource(layerWrapper.getLayer().getSource())).toBe(true);

        ['getLayer', 'setLayer', 'getName', 'setName', 'getId', 'setId'].forEach((prop) => {
            expect(layerWrapper).toHaveProperty(prop);
        });
    });

    // TODO:
    // Testing map-lauer z-index requires mocking of the layer since the external layerWrapper
    // is more complect parameter with both layer, and source gien to the add-function.
    it('should set feature-layer z-index', () => {
        const options = {name: 'Jest'};
        const layerWrapper = LayerManager.addFeatureLayer(options);

        expect(layerWrapper).toBeTruthy();
        expect(layerWrapper.getLayer().getZIndex()).toBeUndefined();
        LayerManager.setFeatureLayerZIndex(layerWrapper.getId(), 1);
        expect(layerWrapper.getLayer().getZIndex()).toBe(1000001);
    });

    it('should create two feature-layers', () => {
        const optionsOne = {name: 'Jest One'};
        const layerWrapperOne = LayerManager.addFeatureLayer(optionsOne);
        expect(LayerManager.getActiveFeatureLayer()).toStrictEqual(layerWrapperOne);

        const optionsTwo = {name: 'Jest Two'};
        const layerWrapperTwo = LayerManager.addFeatureLayer(optionsTwo);
        expect(LayerManager.getActiveFeatureLayer()).toStrictEqual(layerWrapperTwo);

        const callback = (event) => {
            expect(event.detail.layerWrapper).toStrictEqual(layerWrapperOne);
            expect(LayerManager.getActiveFeatureLayer()).toStrictEqual(layerWrapperOne);
        }

        const onCallback = callback.bind(this);
        window.addEventListener('oltb.active.feature.layer.change', onCallback);
        LayerManager.setActiveFeatureLayer(layerWrapperOne);
        window.removeEventListener('oltb.active.feature.layer.change', onCallback);

        LayerManager.removeFeatureLayer(layerWrapperOne);
        LayerManager.removeFeatureLayer(layerWrapperTwo);
    });

    it('should create and remove one feature-layer', () => {
        const options = {name: 'Jest One'};
        const layerWrapper = LayerManager.addFeatureLayer(options);
        expect(LayerManager.getActiveFeatureLayer()).toStrictEqual(layerWrapper);

        const callback = (event) => {
            expect(event.detail.layerWrapper).toStrictEqual(layerWrapper);
            expect(event.detail.isSilent).toBe(true);
        }

        const onCallback = callback.bind(this);
        window.addEventListener('oltb.featureLayer.removed', onCallback);
        LayerManager.removeFeatureLayer(layerWrapper, true);
        window.removeEventListener('oltb.featureLayer.removed', onCallback);
    });

    it('should return default feature-layer if empty', () => {
        LayerManager.removeAllFeatureLayers();
        expect(LayerManager.getFeatureLayerSize()).toBe(0);

        const activeLayer = LayerManager.getActiveFeatureLayer({
            fallback: 'jest'
        });

        expect(LayerManager.getFeatureLayerSize()).toBe(1);
        expect(activeLayer).toHaveProperty('name', 'jest');
        expect(activeLayer).toHaveProperty('isDynamicallyAdded', true);
    });

    it('should add, remove and clear feature from layer', () => {
        const source = {
            addFeature: (feature) => {},
            removeFeature: (feature) => {}
        };

        const layer = {
            getSource: () => {
                return source;
            }
        };
        
        const layerWrapper = {
            getLayer: () => {
                return layer;
            }
        };

        const feature = {};

        expect(LayerManager.getSnapFeatures().getLength()).toBe(0);
        LayerManager.addFeatureToLayer(feature, layerWrapper);
        LayerManager.addFeatureToLayer(feature, layerWrapper);
        expect(LayerManager.getSnapFeatures().getLength()).toBe(2);

        LayerManager.removeFeatureFromLayer(feature, layerWrapper);
        expect(LayerManager.getSnapFeatures().getLength()).toBe(1);
        LayerManager.clearSnapFeatures();
        expect(LayerManager.getSnapFeatures().getLength()).toBe(0);
    });
});
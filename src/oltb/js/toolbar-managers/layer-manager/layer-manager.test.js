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
        expect(LayerManager.isMapLayersEmpty()).toBe(false);

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

        ['getLayer', 'setLayer', 'getName', 'setName', 'getId', 'setId'].forEach((prop) => {
            expect(layerWrapper).toHaveProperty(prop);
        });
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
});
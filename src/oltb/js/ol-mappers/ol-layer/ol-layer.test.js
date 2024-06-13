import { describe, it, expect } from '@jest/globals';
import { LayerOptions, LayerType, instantiateLayer } from './ol-layer';

describe('OpenLayers Layer', () => {
    it('should have two layer-options', () => {
        expect(LayerOptions.length).toBe(2);
    });

    it('should have all layer-options as keys in layer-type', () => {
        LayerOptions.forEach((option) => {
            expect(LayerType[option.value]).toBeTruthy();
        });
    });

    it('should instantiate each layer-type', () => {
        LayerOptions.forEach((option) => {
            const value = option.value;
            const layer = instantiateLayer(option.value, {});

            expect(layer).toBeTruthy();
            expect(layer).toBeInstanceOf(LayerType[value]);
        });
    });

    it('should return null for unknown layer', () => {
        expect(instantiateLayer('unknown-layer', {})).toBeNull();
    });
});
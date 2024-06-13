import { describe, it, expect } from '@jest/globals';
import { SourceOptions, SourceType, instantiateSource } from './ol-source';

describe('OpenLayers Source', () => {
    it('should have four sources', () => {
        expect(SourceOptions.length).toBe(4);
    });

    it('should have all source-options as keys in source-type', () => {
        SourceOptions.forEach((option) => {
            expect(SourceType[option.value]).toBeTruthy();
        });
    });

    it('should instantiate each source-type', () => {
        SourceOptions.forEach((option) => {
            const value = option.value;
            const layer = instantiateSource(option.value, {});

            expect(layer).toBeTruthy();
            expect(layer).toBeInstanceOf(SourceType[value]);
        });
    });

    it('should return null for unknown source', () => {
        expect(instantiateSource('unknown-source', {})).toBeNull();
    });
});
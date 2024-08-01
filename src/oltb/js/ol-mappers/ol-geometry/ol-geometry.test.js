import { describe, it, expect } from '@jest/globals';
import { FunctionOptions, FunctionTypeMapper, instantiateGeometry } from './ol-geometry';

describe('OpenLayers Geometry', () => {
    it('should have Square mapped to Circle', () => {
        const mapper = FunctionTypeMapper['Square'];
        expect(mapper.type).toBe('Circle');
        expect(mapper.parameters).toBe(4);
    });

    it('should have Rectangle mapped to Circle', () => {
        const mapper = FunctionTypeMapper['Rectangle'];
        expect(mapper.type).toBe('Circle');
        expect(mapper.parameters).toBeUndefined();
    });

    it('should have Circle mapped to Circle', () => {
        const mapper = FunctionTypeMapper['Circle'];
        expect(mapper.type).toBe('Circle');
        expect(mapper.parameters).toBe(32);
    });

    it('should instantiate each geometry-type', () => {
        FunctionOptions.forEach((option) => {
            const [ type, callback ] = instantiateGeometry(option);
            expect(type).toBeTruthy();
            expect(callback).toBeTruthy();
        });
    });

    it('should return default type (Polygon) with undefined callback', () => {
        const [ type, callback ] = instantiateGeometry('unknown-geometry');
        expect(type).toBe('Polygon');
        expect(callback).toBeUndefined();
    });

    it('should return given type with undefined callback', () => {
        const [ type, callback ] = instantiateGeometry('LineString');
        expect(type).toBe('LineString');
        expect(callback).toBeUndefined();
    });
});
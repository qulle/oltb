import { describe, it, expect } from '@jest/globals';
import { FeatureProperties } from './feature-properties';
import { isFeatureIntersectable } from "./is-feature-intersectable";

describe('isFeatureIntersectable', () => {
    it('should test other types as intersectable', () => {
        const type = FeatureProperties.type.drawing;
        const geometry = {
            getType: () => {return 'Polygon';}
        };

        expect(isFeatureIntersectable(type, geometry)).toBe(true);
    });

    it('should test [IconMarker] as not intersectable', () => {
        const type = FeatureProperties.type.iconMarker;
        const geometry = {
            getType: () => {return 'Point';}
        };

        expect(isFeatureIntersectable(type, geometry)).toBe(false);
    });

    it('should test [WindBarb] as not intersectable', () => {
        const type = FeatureProperties.type.windBarb;
        const geometry = {
            getType: () => {return 'Point';}
        };

        expect(isFeatureIntersectable(type, geometry)).toBe(false);
    });

    it('should test [Measurement] as not intersectable', () => {
        const type = FeatureProperties.type.windBarb;
        const geometry = {
            getType: () => {return 'LineString';}
        };

        expect(isFeatureIntersectable(type, geometry)).toBe(false);
    });

    it('should test [Layer] as not intersectable', () => {
        const type = FeatureProperties.type.windBarb;
        const geometry = {
            getType: () => {return 'Point';}
        };

        expect(isFeatureIntersectable(type, geometry)).toBe(false);
    });
});
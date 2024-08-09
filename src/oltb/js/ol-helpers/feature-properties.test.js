import { describe, it, expect } from '@jest/globals';
import { FeatureProperties } from './feature-properties';

describe('FeatureProperties', () => {
    it('should contain a top level node with name type', () => {
        expect(FeatureProperties.type).toBeTruthy();
    });

    it('should have the following sub-types', () => {
        expect(FeatureProperties.type).toStrictEqual({
            layer: 'layer',
            iconMarker: 'iconMarker',
            windBarb: 'windBarb',
            measurement: 'measurement',
            drawing: 'drawing',
            snapLine: 'snapLine'
        });
    });
});
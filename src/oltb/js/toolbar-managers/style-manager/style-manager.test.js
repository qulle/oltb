import { jest, describe, it, expect } from '@jest/globals';
import { StyleManager } from './style-manager';
import { FeatureManager } from '../feature-manager/feature-manager';
import '../../browser-prototypes/string';

const FILENAME = 'style-manager.js';

describe('StyleManager', () => {
    it('should init the manager', async () => {
        return StyleManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(StyleManager, 'setMap');
        const map = {};

        StyleManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(StyleManager.getName()).toBe(FILENAME);
    });

    it('should have zero styles at rirst', () => {
        expect(StyleManager.getSize()).toBe(0);
    });

    it('should get default style', () => {
        const resolution = 5000;
        const oltb = {
            type: 'default'
        };

        const feature = {
            get: () => {
                return oltb;
            }
        };

        expect(StyleManager.getStyle(feature, resolution)).toBeUndefined();
    });


    it('should return void due to no/empty oltb property', () => {
        const resolution = 5000;
        const feature = {
            get: () => {
                return undefined;
            }
        };

        expect(StyleManager.getStyle(feature, resolution)).toBe(void 0);
    });

    it('should have two style [icon, label] after call to getStyle [WindBarb]', () => {
        const resolution = 1000;
        const options = {
            lon: 0,
            lat: 0
        };

        const windBarb = FeatureManager.generateWindBarb(options);
        const style = StyleManager.getStyle(windBarb, resolution);

        expect(style).toBeTruthy();
        expect(StyleManager.getSize()).toBe(2);

        StyleManager.clearStyles();
        expect(StyleManager.getSize()).toBe(0);
    });

    it('should have tree style [icon, label, cicle] after call to getStyle [IconMarker]', () => {
        const resolution = 1000;
        const options = {
            lon: 0,
            lat: 0
        };

        const marker = FeatureManager.generateIconMarker(options);
        const style = StyleManager.getStyle(marker, resolution);

        expect(style).toBeTruthy();
        expect(StyleManager.getSize()).toBe(3);

        StyleManager.clearStyles();
        expect(StyleManager.getSize()).toBe(0);
    });

    it('should have tree style [icon, label, cicle] after call to getStyle with same recipe [IconMarker]', () => {
        const resolution = 1000;
        const options = {
            lon: 0,
            lat: 0
        };

        const markerOne = FeatureManager.generateIconMarker(options);
        const markerTwo = FeatureManager.generateIconMarker(options);

        const styleOne = StyleManager.getStyle(markerOne, resolution);
        const styleTwo = StyleManager.getStyle(markerTwo, resolution);

        expect(styleOne).toBeTruthy();
        expect(styleTwo).toBeTruthy();
        expect(StyleManager.getSize()).toBe(3);

        StyleManager.clearStyles();
        expect(StyleManager.getSize()).toBe(0);
    });
});
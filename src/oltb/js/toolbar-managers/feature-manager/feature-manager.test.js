import { jest, describe, it, expect } from '@jest/globals';
import { FeatureManager } from './feature-manager';

const FILENAME = 'feature-manager.js';

describe('FeatureManager', () => {
    it('should init the manager', async () => {
        return FeatureManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(FeatureManager, 'setMap');
        const map = {};

        FeatureManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(FeatureManager.getName()).toBe(FILENAME);
    });

    it('should test [getType]', () => {
        const props = {
            oltb: {
                type: 'jest'
            }
        };

        const featureOne = {getProperties: () => {}};
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.getType(featureOne)).toBeUndefined();
        expect(FeatureManager.getType(featureTwo)).toBe('jest');
    });

    it('should test [isWindBarbType]', () => {
        const props = {
            oltb: {
                type: 'windBarb'
            }
        };

        const featureOne = {getProperties: () => {}};
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.isWindBarbType(featureOne)).toBe(false);
        expect(FeatureManager.isWindBarbType(featureTwo)).toBe(true);
    });

    it('should test [isIconMarkerType]', () => {
        const props = {
            oltb: {
                type: 'iconMarker'
            }
        };

        const featureOne = {getProperties: () => {}};
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.isIconMarkerType(featureOne)).toBe(false);
        expect(FeatureManager.isIconMarkerType(featureTwo)).toBe(true);
    });

    it('should test [isMeasurementType]', () => {
        const props = {
            oltb: {
                type: 'measurement'
            }
        };

        const featureOne = {getProperties: () => {}};  
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.isMeasurementType(featureOne)).toBe(false);
        expect(FeatureManager.isMeasurementType(featureTwo)).toBe(true);
    });

    it('should test [shouldHighlightOnHover]', () => {
        const props = {
            oltb: {
                settings: {
                    shouldHighlightOnHover: true
                }
            }
        };

        const featureOne = {getProperties: () => {}};  
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.shouldHighlightOnHover(featureOne)).toBe(false);
        expect(FeatureManager.shouldHighlightOnHover(featureTwo)).toBe(true);
    });

    it('should test [shouldHighlightOnHover]', () => {
        const props = {
            oltb: {
                settings: {
                    shouldHighlightOnHover: true
                }
            }
        };

        const featureOne = {getProperties: () => {}};   
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.shouldHighlightOnHover(featureOne)).toBe(false);
        expect(FeatureManager.shouldHighlightOnHover(featureTwo)).toBe(true);
    });

    it('should test [hasInfoWindow]', () => {
        const props = {
            oltb: {
                infoWindow: '<div>InfoWindow</div>'
            }
        };

        const featureOne = {getProperties: () => {}};   
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.hasInfoWindow(featureOne)).toBe(false);
        expect(FeatureManager.hasInfoWindow(featureTwo)).toBe(true);
    });

    it('should test [getInfoWindow]', () => {
        const props = {
            oltb: {
                infoWindow: '<div>InfoWindow</div>'
            }
        };

        const featureOne = {getProperties: () => {}};   
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.getInfoWindow(featureOne)).toBeUndefined();
        expect(FeatureManager.getInfoWindow(featureTwo)).toBe('<div>InfoWindow</div>');
    });

    it('should test [hasTooltip]', () => {
        const props = {
            oltb: {
                tooltip: '<div>Tooltip</div>'
            }
        };

        const featureOne = {getProperties: () => {}};   
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.hasTooltip(featureOne)).toBe(false);
        expect(FeatureManager.hasTooltip(featureTwo)).toBe(true);
    });

    it('should test [getTooltip]', () => {
        const props = {
            oltb: {
                tooltip: '<div>Tooltip</div>'
            }
        };

        const featureOne = {getProperties: () => {}};   
        const featureTwo = {getProperties: () => { return props; }};

        expect(FeatureManager.getTooltip(featureOne)).toBeUndefined();
        expect(FeatureManager.getTooltip(featureTwo)).toBe('<div>Tooltip</div>');
    });

    it('should generate [WindBarb]', () => {
        const options = {
            lon: 0,
            lat: 0
        };

        const windBarb = FeatureManager.generateWindBarb(options);

        expect(windBarb).toBeTruthy();
        expect(FeatureManager.isWindBarbType(windBarb)).toBe(true);
        expect(FeatureManager.isMeasurementType(windBarb)).toBe(false);
        expect(FeatureManager.isIconMarkerType(windBarb)).toBe(false);
    });

    it('should generate [IconMarker]', () => {
        const options = {
            lon: 0,
            lat: 0
        };

        const marker = FeatureManager.generateIconMarker(options);

        expect(marker).toBeTruthy();
        expect(FeatureManager.isIconMarkerType(marker)).toBe(true);
        expect(FeatureManager.isWindBarbType(marker)).toBe(false);
        expect(FeatureManager.isMeasurementType(marker)).toBe(false);
    });

    it('should check if same feature', () => {
        const a = {};
        const b = {};
        expect(FeatureManager.isSameFeature(a, b)).toBe(false);
        expect(FeatureManager.isSameFeature(a, undefined)).toBe(false);

        a['ol_uid'] = 'jest';
        expect(FeatureManager.isSameFeature(a, b)).toBe(false);

        a['ol_uid'] = 'foo';
        b['ol_uid'] = 'bar';
        expect(FeatureManager.isSameFeature(a, b)).toBe(false);

        a['ol_uid'] = 'jest';
        b['ol_uid'] = 'jest';
        expect(FeatureManager.isSameFeature(a, b)).toBe(true);
    });
});
import { jest, describe, it, expect } from '@jest/globals';
import { ConversionManager } from './conversion-manager';

const FILENAME = 'conversion-manager.js';

describe('Conversions', () => {
    it('should init the manager', async () => {
        return ConversionManager.initAsync({}).then((result) => {
            expect(result).toStrictEqual({
                filename: FILENAME,
                result: true
            });
        });
    });

    it('should have two overridden methods [setMap, getName]', () => {
        const spyOnSetMap = jest.spyOn(ConversionManager, 'setMap');
        const map = {};

        ConversionManager.setMap(map);
        expect(spyOnSetMap).toHaveBeenCalled();
        expect(ConversionManager.getName()).toBe(FILENAME);
    });

    describe('roundUpToNearest', () => {
        it('should roundUp 0 to 0', () => {
            expect(ConversionManager.roundUpToNearest(0, 1)).toEqual(0);
        });

        it('should roundUp 1 to 5', () => {
            expect(ConversionManager.roundUpToNearest(1, 5)).toEqual(5);
        });

        it('should roundUp 1.8 to 2.0', () => {
            expect(ConversionManager.roundUpToNearest(1.8, 2.0)).toEqual(2.0);
        });
    });

    describe('roundDownToNearest', () => {
        it('should roundDown 0 to 0', () => {
            expect(ConversionManager.roundDownToNearest(0, 1)).toEqual(0);
        });

        it('should roundDown 15 to 10', () => {
            expect(ConversionManager.roundDownToNearest(15, 10)).toEqual(10);
        });

        it('should roundDown 1.8 to 1.5', () => {
            expect(ConversionManager.roundDownToNearest(1.8, 0.5)).toEqual(1.5);
        });
    });
    
    describe('degreesToRadians', () => {
        it('should convert 0 degrees to 0 radians', () => {
            expect(ConversionManager.degreesToRadians(0)).toEqual(0);
        });

        it('should convert 1 degrees to 0.01745 radians', () => {
            expect(Number(ConversionManager.degreesToRadians(1).toFixed(5))).toEqual(0.01745);
        });
    
        it('should convert 90 degrees to 1.57080 radians', () => {
            expect(Number(ConversionManager.degreesToRadians(90).toFixed(5))).toEqual(1.57080);
        });

        it('should convert -180 degrees to -3.14159 radians', () => {
            expect(Number(ConversionManager.degreesToRadians(-180).toFixed(5))).toEqual(-3.14159);
        });
    });

    describe('radiansToDegrees', () => {
        it('should convert 0 radians to 0 degrees', () => {
            expect(ConversionManager.radiansToDegrees(0)).toEqual(0);
        });

        it('should convert 0.0174533 radians to 1 degrees', () => {
            expect(ConversionManager.roundToNearest(ConversionManager.radiansToDegrees(0.0174533), 1)).toEqual(1);
        });
    
        it('should convert 1.5708 radians to 90 degrees ', () => {
            expect(ConversionManager.roundToNearest(ConversionManager.radiansToDegrees(1.57080), 10)).toEqual(90);
        });

        it('should convert -3.14159 radians -180 degree', () => {
            expect(ConversionManager.roundToNearest(ConversionManager.radiansToDegrees(-3.14159), 10)).toEqual(-180);
        });
    });

    describe('metersPerSecondToKnots', () => {
        it('should convert 0 m/s to 0 knots', () => {
            expect(ConversionManager.metersPerSecondToKnots(0)).toEqual(0);
        });

        it('should convert 1 m/s to 1.94384 knots', () => {
            expect(Number(ConversionManager.metersPerSecondToKnots(1).toFixed(5))).toEqual(1.94384);
        });

        it('should convert 25 m/s to 48.5961 knots', () => {
            expect(Number(ConversionManager.metersPerSecondToKnots(25).toFixed(5))).toEqual(48.596);
        });
    });

    describe('knotsToMetersPerSecond', () => {
        it('should convert 0 knots to 0 m/s', () => {
            expect(ConversionManager.knotsToMetersPerSecond(0)).toEqual(0);
        });

        it('should convert 1 knot to 0.51444 m/s', () => {
            expect(Number(ConversionManager.knotsToMetersPerSecond(1).toFixed(5))).toEqual(0.51444);
        });

        it('should convert 25 knots to 12.8611 m/s', () => {
            expect(Number(ConversionManager.knotsToMetersPerSecond(25).toFixed(5))).toEqual(12.861);
        });
    });
});
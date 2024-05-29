import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';

const FILENAME = 'conversion-manager.js';

/**
 * About:
 * ConversionManager
 * 
 * Description:
 * Manager responsible for converting different types of numerical values.
 */
class ConversionManager extends BaseManager {
    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        return new Promise((resolve) => {
            resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static roundToNearest(value, nearest) {
        return Math.round(value / nearest) * nearest;
    }
    
    static roundUpToNearest(value, nearest) {
        return Math.ceil(value / nearest) * nearest;
    }
    
    static roundDownToNearest(value, nearest) {
        return Math.floor(value / nearest) * nearest;
    }
    
    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    static metersPerSecondToKnots(mps) {
        return mps * 1.94384;
    }
    
    static knotsToMetersPerSecond(knots) {
        return knots * 0.51444;
    }
}

export { ConversionManager };
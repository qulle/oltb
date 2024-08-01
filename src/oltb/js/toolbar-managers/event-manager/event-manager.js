import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';

const FILENAME = 'event-manager.js';

/**
 * About:
 * EventManager
 * 
 * Description:
 * Manages all events, both dispatching custom events and on/off of listeners.
 */
class EventManager extends BaseManager {
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
    static on(context, type, callback) {

    }

    static off(context, type) {
        
    }

    static dispatchEvent(elements, type, options = {}) {
        const event = new Event(type, options);
    
        elements.forEach((element) => {
            element.dispatchEvent(event);
        });

        return event;
    }

    static dispatchCustomEvent(elements, type, options = {}) {
        const event = new CustomEvent(type, options);

        elements.forEach((element) => {
            element.dispatchEvent(event);
        });

        return event;
    }
}

export { EventManager };
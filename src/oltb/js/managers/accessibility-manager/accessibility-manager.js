import { Keys } from '../../helpers/constants/Keys';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from '../LogManager';

const FILENAME = 'managers/AccessibilityManager.js';
const CLASS_ACCESSIBILITY = 'oltb-using-keyboard';

/**
 * About:
 * AccessibilityManager
 * 
 * Description:
 * Manages toggle of class 'oltb-using-keyboard' on the body element that is used to enable specific
 * styling on elements. Example button focus style.
 */
class AccessibilityManager {
    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        window.document.body.addEventListener(Events.browser.mouseDown, this.#onMouseDown.bind(this));
        window.document.body.addEventListener(Events.browser.keyDown, this.#onKeyboardDown.bind(this));

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
    // # Section: Events
    //--------------------------------------------------------------------
    static #onKeyboardDown(event) {
        if(event.key === Keys.valueTab) {
            window.document.body.classList.add(CLASS_ACCESSIBILITY);
        }
    }

    static #onMouseDown(event) {
        window.document.body.classList.remove(CLASS_ACCESSIBILITY);
    }
}

export { AccessibilityManager };
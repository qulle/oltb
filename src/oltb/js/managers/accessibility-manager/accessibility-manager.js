import { Keys } from '../../helpers/constants/keys';
import { Events } from '../../helpers/constants/events';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';

const FILENAME = 'accessibility-manager.js';
const CLASS__ACCESSIBILITY = 'oltb-using-keyboard';

/**
 * About:
 * AccessibilityManager
 * 
 * Description:
 * Manages toggle of class 'oltb-using-keyboard' on the body element that is used to enable specific
 * styling on elements. Example button focus style.
 */
class AccessibilityManager extends BaseManager {
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
            window.document.body.classList.add(CLASS__ACCESSIBILITY);
        }
    }

    static #onMouseDown(event) {
        window.document.body.classList.remove(CLASS__ACCESSIBILITY);
    }
}

export { AccessibilityManager };
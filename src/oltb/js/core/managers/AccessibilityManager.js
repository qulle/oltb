import { Keys } from "../../helpers/constants/Keys";
import { Events } from "../../helpers/constants/Events";
import { LogManager } from "./LogManager";

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
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        document.body.addEventListener(Events.browser.mouseDown, this.#onMouseDown.bind(this));
        document.body.addEventListener(Events.browser.keyDown, this.#onKeyBoardDown.bind(this));

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

    // -------------------------------------------------------------------
    // # Section: Events
    // -------------------------------------------------------------------

    static #onKeyBoardDown(event) {
        if(event.key === Keys.valueTab) {
            document.body.classList.add(CLASS_ACCESSIBILITY);
        }
    }

    static #onMouseDown(event) {
        document.body.classList.remove(CLASS_ACCESSIBILITY);
    }
}

export { AccessibilityManager };
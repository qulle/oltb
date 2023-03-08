import { KEYS } from "../../helpers/constants/Keys";
import { EVENTS } from "../../helpers/constants/Events";
import { LogManager } from "./LogManager";

const FILENAME = 'managers/AccessibilityManager.js';

class AccessibilityManager {
    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initializing started');

        document.body.addEventListener(EVENTS.Browser.MouseDown, this.#onMouseDown.bind(this));
        document.body.addEventListener(EVENTS.Browser.KeyDown, this.#onKeyBoardDown.bind(this));
    }

    static setMap(map) { }

    static #onKeyBoardDown(event) {
        if(event.key.toLowerCase() === KEYS.Tab) {
            document.body.classList.add('oltb-using-keyboard');
        }
    }

    static #onMouseDown(event) {
        document.body.classList.remove('oltb-using-keyboard');
    }
}

export { AccessibilityManager };
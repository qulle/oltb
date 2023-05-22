import { Keys } from "../../helpers/constants/Keys";
import { Events } from "../../helpers/constants/Events";
import { LogManager } from "./LogManager";

const FILENAME = 'managers/AccessibilityManager.js';
const ACCESSIBILITY_CLASS = 'oltb-using-keyboard';

class AccessibilityManager {
    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');

        document.body.addEventListener(Events.browser.mouseDown, this.#onMouseDown.bind(this));
        document.body.addEventListener(Events.browser.keyDown, this.#onKeyBoardDown.bind(this));
    }

    static setMap(map) { }

    static #onKeyBoardDown(event) {
        if(event.key === Keys.valueTab) {
            document.body.classList.add(ACCESSIBILITY_CLASS);
        }
    }

    static #onMouseDown(event) {
        document.body.classList.remove(ACCESSIBILITY_CLASS);
    }
}

export { AccessibilityManager };
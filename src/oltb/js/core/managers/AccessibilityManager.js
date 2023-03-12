import { Keys } from "../../helpers/constants/Keys";
import { Events } from "../../helpers/constants/Events";
import { LogManager } from "./LogManager";

const FILENAME = 'managers/AccessibilityManager.js';

class AccessibilityManager {
    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initializing started');

        document.body.addEventListener(Events.browser.mouseDown, this.#onMouseDown.bind(this));
        document.body.addEventListener(Events.browser.keyDown, this.#onKeyBoardDown.bind(this));
    }

    static setMap(map) { }

    static #onKeyBoardDown(event) {
        if(event.key === Keys.valueTab) {
            document.body.classList.add('oltb-using-keyboard');
        }
    }

    static #onMouseDown(event) {
        document.body.classList.remove('oltb-using-keyboard');
    }
}

export { AccessibilityManager };
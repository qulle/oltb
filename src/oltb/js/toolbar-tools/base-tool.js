import { Control } from 'ol/control';
import { LogManager } from '../toolbar-managers/log-manager/log-manager';
import { ElementManager } from '../toolbar-managers/element-manager/element-manager';

const FILENAME = 'base-tool.js';

class BaseTool extends Control {
    #filename = FILENAME;

    constructor(options = {}) {
        super({
            element: options.element ?? ElementManager.getToolbarElement()
        });

        if(options.filename) {
            this.#filename = options.filename;
        }
    }

    detachGlobalListeners() {}

    //--------------------------------------------------------------------
    // # Section: Base Methods
    //--------------------------------------------------------------------
    getName() {
        return this.#filename;
    }

    onClickTool(event) {
        LogManager.logDebug(this.#filename, 'onClickTool', 'User clicked tool');
    }
}

export { BaseTool };
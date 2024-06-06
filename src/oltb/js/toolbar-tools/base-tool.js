import { Control } from 'ol/control';
import { LogManager } from '../toolbar-managers/log-manager/log-manager';
import { ElementManager } from '../toolbar-managers/element-manager/element-manager';

class BaseTool extends Control {
    #filename = undefined;

    constructor(options = {}) {
        super({
            element: options.element ?? ElementManager.getToolbarElement()
        });

        this.#filename = options.filename || 'Missing filename';
        
        LogManager.logDebug(this.#filename, 'constructor', 'init');
    }

    //--------------------------------------------------------------------
    // # Section: Base Methods
    //--------------------------------------------------------------------
    getFilename() {
        return this.#filename;
    }

    onClickTool(event) {
        LogManager.logDebug(this.#filename, 'onClickTool', 'User clicked tool');
    }
}

export { BaseTool };
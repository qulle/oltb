import { LogManager } from './LogManager';

const FILENAME = 'managers/ToolManager.js';

/**
 * About:
 * ToolManager
 * 
 * Description:
 * Manages the current active tool that cannot be used with all other tools.
 * Examples are Edit-, Draw- and Measure tool.
 */
class ToolManager {
    static #tool;

    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
    }

    static setMap(map) { }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static setActiveTool(tool) {
        if(this.#tool && this.#tool !== tool) {
            this.#tool.deSelectTool();
        }

        this.#tool = tool;
    }

    static getActiveTool() {
        return this.#tool;
    }

    static hasActiveTool() {
        return this.#tool !== undefined;
    }

    static removeActiveTool() {
        this.#tool = undefined;
    }
}

export { ToolManager };
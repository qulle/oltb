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

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static setActiveTool(tool) {
        if(this.#tool && this.#tool !== tool) {
            this.#tool.deselectTool();
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
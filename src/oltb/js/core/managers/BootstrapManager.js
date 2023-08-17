import { Config } from "../Config";
import { LogManager } from "./LogManager";

const FILENAME = 'managers/BootstrapManager.js';

/**
 * About:
 * BootstrapManager
 * 
 * Description:
 * Manages the init process and ensures that all code is executed in the correct order.
 */
class BootstrapManager {
    static #managers = [];

    static async initAsync(items = []) {
        LogManager.logInformation(FILENAME, 'initAsync', 'Manager initialization started');

        const oltbVersion = Config.toolbar.version;
        const openLayersVersion = Config.openLayers.version;

        document.documentElement.setAttribute('ol-version', openLayersVersion);
        document.documentElement.setAttribute('oltb-version', oltbVersion);
        
        LogManager.logInformation(FILENAME, 'initAsync', `Running OL version ${openLayersVersion}`);
        LogManager.logInformation(FILENAME, 'initAsync', `Running OLTB version ${oltbVersion}`);

        for(const item of items) {
            const manager = item.manager;
            const options = item.options || {};

            this.#managers.push(manager);
            await manager.initAsync(options);
        }

        LogManager.logInformation(FILENAME, 'initAsync', 'Manager initialization ended');
    }

    static setMap(map) {
        LogManager.logInformation(FILENAME, 'setMap', 'Map is ready to use');

        this.#managers.forEach((manager) => {
            manager.setMap(map);
        });
    }

    static getName() {
        return FILENAME;
    }
}

export { BootstrapManager };
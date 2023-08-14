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

    static init(managers = []) {
        const oltbVersion = Config.toolbar.version;
        const openLayersVersion = Config.openLayers.version;

        document.documentElement.setAttribute('ol-version', openLayersVersion);
        document.documentElement.setAttribute('oltb-version', oltbVersion);
        
        LogManager.logInformation(FILENAME, 'init', `Running OL version ${openLayersVersion}`);
        LogManager.logInformation(FILENAME, 'init', `Running OLTB version ${oltbVersion}`);

        managers.forEach((item) => {
            const manager = item.manager;
            const options = item.options || {};

            this.#managers.push(manager);
            manager.init(options);
        });
    }

    static setMap(map) {
        LogManager.logInformation(FILENAME, 'setMap', 'Map is ready to use');

        this.#managers.forEach((manager) => {
            manager.setMap(map);
        });
    }
}

export { BootstrapManager };
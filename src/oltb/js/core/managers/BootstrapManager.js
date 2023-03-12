import { Config } from "../Config";
import { LogManager } from "./LogManager";

const FILENAME = 'managers/BootstrapManager.js';

class BootstrapManager {
    static #managers = [];

    static init(managers = []) {
        const oltbVersion = Config.toolbar.version;
        const openLayersVersion = Config.openLayers.version;

        document.documentElement.setAttribute('ol-version', openLayersVersion);
        document.documentElement.setAttribute('oltb-version', oltbVersion);
        
        LogManager.logInformation(FILENAME, 'init', `Running OL version ${openLayersVersion}`);
        LogManager.logInformation(FILENAME, 'init', `Running OLTB version ${oltbVersion}`);

        managers.forEach((manager) => {
            this.#managers.push(manager);
            manager.init();
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
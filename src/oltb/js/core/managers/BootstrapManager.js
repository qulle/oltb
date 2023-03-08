import { CONFIG } from "../Config";
import { LogManager } from "./LogManager";

const FILENAME = 'managers/BootstrapManager.js';

class BootstrapManager {
    static init(managers = []) {
        const oltbVersion = CONFIG.Version;
        const openLayersVersion = CONFIG.OpenLayers.Version;

        document.documentElement.setAttribute('oltb-version', oltbVersion);
        
        LogManager.logInformation(FILENAME, 'init', `Running OL version ${openLayersVersion}`);
        LogManager.logInformation(FILENAME, 'init', `Running OLTB version ${oltbVersion}`);

        managers.forEach((manager) => {
            manager.init();
        });
    }

    static setMap(map, managers = []) {
        LogManager.logInformation(FILENAME, 'setMap', 'Map is redy');

        managers.forEach((manager) => {
            manager.setMap(map);
        });
    }
}

export { BootstrapManager };
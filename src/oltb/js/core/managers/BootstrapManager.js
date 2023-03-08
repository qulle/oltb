import { CONFIG } from "../Config";
import { LogManager } from "./LogManager";

const FILENAME = 'managers/BootstrapManager.js';

class BootstrapManager {
    static init(map, managers = []) {
        const oltbVersion = CONFIG.Version;
        const openLayersVersion = CONFIG.OpenLayersVersion;

        document.documentElement.setAttribute('oltb-version', oltbVersion);
        
        LogManager.logInformation(FILENAME, 'init', `Running OL version ${openLayersVersion}`);
        LogManager.logInformation(FILENAME, 'init', `Running OLTB version ${oltbVersion}`);

        managers.forEach((manager) => {
            manager.init(map);
        });
    }
}

export { BootstrapManager };
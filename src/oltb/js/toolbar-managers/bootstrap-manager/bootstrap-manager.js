import { Events } from '../../browser-constants/events';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { ConfigManager } from '../config-manager/config-manager';

const FILENAME = 'bootstrap-manager.js';

/**
 * About:
 * BootstrapManager
 * 
 * Description:
 * Manages the init process and ensures that all code is executed in the correct order.
 */
class BootstrapManager extends BaseManager {
    static #managers = [];

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(items = []) {
        LogManager.logInformation(FILENAME, 'initAsync', 'Manager initialization started');

        const config = ConfigManager.getConfig();
        const oltbVersion = config.toolbar.version;
        const openLayersVersion = config.openLayers.version;

        window.document.documentElement.setAttribute('ol-version', openLayersVersion);
        window.document.documentElement.setAttribute('oltb-version', oltbVersion);
        
        LogManager.logInformation(FILENAME, 'initAsync', `Running OL version ${openLayersVersion}`);
        LogManager.logInformation(FILENAME, 'initAsync', `Running OLTB version ${oltbVersion}`);

        const results = [];
        for(const item of items) {
            const manager = item.manager;
            const options = item.options || {};

            this.#managers.push(manager);
            const result = await manager.initAsync(options);
            results.push(result);
        }

        LogManager.logInformation(FILENAME, 'initAsync', 'Manager initialization ended');
        LogManager.logInformation(FILENAME, 'initAsync', results);
    }

    static setMap(map) {
        LogManager.logInformation(FILENAME, 'setMap', 'OL is ready to use');

        this.#managers.forEach((manager) => {
            manager.setMap(map);
        });
    }

    static ready() {
        LogManager.logInformation(FILENAME, 'ready', 'OLTB is ready to use');

        window.dispatchEvent(new CustomEvent(Events.custom.ready));
    }

    static getName() {
        return FILENAME;
    }
}

export { BootstrapManager };
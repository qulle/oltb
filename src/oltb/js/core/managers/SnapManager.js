
import { Snap } from 'ol/interaction';
import { LogManager } from './LogManager';
import { LayerManager } from './LayerManager';
import { SettingsManager } from './SettingsManager';
import { Settings } from '../../helpers/constants/Settings';

const FILENAME = 'managers/SnapManager.js';

class SnapManager {
    static #map;
    static #tool;
    static #interaction;

    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');

        const features = LayerManager.getSnapFeatures();
        this.#interaction = new Snap({
            features: features,
            pixelTolerance: 10,
            edge: true,
            vertex: true
        });
    }

    static setMap(map) {
        this.#map = map;
    }

    static isSnapEnabled() {
        return SettingsManager.getSetting(Settings.snapInteraction);
    }

    static addSnap(tool) {
        const isEnabled = this.isSnapEnabled();

        LogManager.logInformation(FILENAME, 'addSnap', {
            info: 'Snap interaction requested',
            isEnabled: isEnabled,
            requestedBy: tool.getName()
        });

        if(!isEnabled) {
            return;
        }

        this.#tool = tool;
        this.#map.addInteraction(this.#interaction);
    }

    static removeSnap() {
        this.#tool = undefined;
        this.#map.removeInteraction(this.#interaction);
    }

    static getActivatedBy() {
        return this.#tool;
    }
}

export { SnapManager };
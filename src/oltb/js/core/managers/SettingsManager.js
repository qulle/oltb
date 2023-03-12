import { Settings } from "../../helpers/constants/Settings";
import { LogManager } from './LogManager';
import { StateManager } from "./StateManager";
import { LocalStorageKeys } from "../../helpers/constants/LocalStorageKeys";

const FILENAME = 'managers/SettingsManager.js';

const LocalStorageNodeName = LocalStorageKeys.settingsManager;
const LocalStorageDefaults = Object.freeze({});

const DefaultSettings = new Map([
    [
        Settings.mouseWheelZoom, {
            state: false, 
            text: 'Enable zooming using mousewheel only'
        }
    ], [
        Settings.altShiftDragRotate, {
            state: true, 
            text: 'Enable rotate of map using Shift + Alt + Drag'
        }
    ], [
        Settings.dragPan, {
            state: true, 
            text: 'Enable dragging using mouse only'
        }
    ], [
        Settings.keyboardZoom, {
            state: true, 
            text: 'Enable zooming using keyboard'
        }
    ], [
        Settings.keyboardPan, {
            state: true, 
            text: 'Enable panning using keyboard'
        }
    ], [
        Settings.selectVectorMapShapes, {
            state: false, 
            text: 'Enable select of shapes in vector map layers'
        }
    ], [
        Settings.alwaysNewLayers, {
            state: false, 
            text: 'Always create new layer when selecting tool'
        }
    ],
]);

class SettingsManager {
    static #localStorage;
    static #settings = structuredClone(DefaultSettings);

    static init() {
        LogManager.logDebug(FILENAME, 'init', 'Initializing started');
        
        // Update the states of the settings with values from localStorage
        this.#localStorage = this.#loadBrowserData();
        this.#settings.forEach((value, key) => {
            if(key in this.#localStorage) {
                value.state = this.#localStorage[key];
            }
        });
    }

    static setMap(map) { }

    static #loadBrowserData() {
        LogManager.logDebug(FILENAME, 'loadBrowserData', 'Loading settings from browser');

        const localStorageState = StateManager.getStateObject(LocalStorageNodeName);
        const localStorage = { ...LocalStorageDefaults, ...localStorageState };

        return localStorage;
    }

    static getSettings() {
        return this.#settings;
    }

    static clear() {
        this.#settings = structuredClone(DefaultSettings);
    }

    static addSetting(key, valueObj) {
        DefaultSettings.set(key, structuredClone(valueObj));
        this.#settings.set(key, valueObj);
    }

    static setSetting(key, state) {
        this.#settings.get(key).state = state;
        this.#localStorage[key] = state;

        StateManager.setStateObject(LocalStorageNodeName, this.#localStorage);
    }

    static getSetting(key) {
        return this.#settings.get(key).state;
    }
}

export { SettingsManager };
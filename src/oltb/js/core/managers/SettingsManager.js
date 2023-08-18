import _ from "lodash";
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
            text: 'Zoom Map Using Mousewheel Only'
        }
    ], [
        Settings.altShiftDragRotate, {
            state: true, 
            text: 'Rotate Map Using Shift + Alt + Drag'
        }
    ], [
        Settings.dragPan, {
            state: true, 
            text: 'Drag Map Using Mouse Only'
        }
    ], [
        Settings.keyboardZoom, {
            state: true, 
            text: 'Zoom Map Using Keyboard'
        }
    ], [
        Settings.keyboardPan, {
            state: true, 
            text: 'Pan Map Using Keyboard'
        }
    ], [
        Settings.selectVectorMapShapes, {
            state: false, 
            text: 'Select Shapes In Vector Map Layers'
        }
    ], [
        Settings.snapInteraction, {
            state: true, 
            text: 'Snap Interaction'
        }
    ], [
        Settings.snapHelpLines, {
            state: true, 
            text: 'Snap Help Lines'
        }
    ], [
        Settings.alwaysNewLayer, {
            state: false, 
            text: 'Create New Layer When Selecting Tool'
        }
    ]
]);

/**
 * About:
 * SettingsManager
 * 
 * Description:
 * Manages all user settings. 
 * The settings can be viewed and updated using the SettingsTool.
 */
class SettingsManager {
    static #localStorage;
    static #settings = _.cloneDeep(DefaultSettings);

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');
        
        // Note: The runtime state must be updated with values from localStorage
        this.#localStorage = this.#getBrowserData();
        this.#settings.forEach((value, key) => {
            if(key in this.#localStorage) {
                value.state = this.#localStorage[key];
            }
        });

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
    // # Section: Internal
    // -------------------------------------------------------------------

    static #getBrowserData() {
        LogManager.logDebug(FILENAME, 'getBrowserData', 'Loading settings from browser');
        
        const localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        return localStorage;
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static getSettings() {
        return this.#settings;
    }

    static clear() {
        this.#settings = _.cloneDeep(DefaultSettings);
    }

    static addSetting(key, valueObj) {
        // Note: Check if there exists a value already in the browser for this setting
        // Must overwrite the literal value that the tools is adding
        const state = this.#localStorage[key];
        if(state !== undefined) {
            valueObj.state = state;
        }

        DefaultSettings.set(key, _.cloneDeep(valueObj));
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
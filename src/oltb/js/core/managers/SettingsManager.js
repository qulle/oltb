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
            text: 'Enable Zooming Using Mousewheel Only'
        }
    ], [
        Settings.altShiftDragRotate, {
            state: true, 
            text: 'Enable Rotate Map Using Shift + Alt + Drag'
        }
    ], [
        Settings.dragPan, {
            state: true, 
            text: 'Enable Dragging Using Mouse Only'
        }
    ], [
        Settings.keyboardZoom, {
            state: true, 
            text: 'Enable Zooming Using Keyboard'
        }
    ], [
        Settings.keyboardPan, {
            state: true, 
            text: 'Enable Panning Using Keyboard'
        }
    ], [
        Settings.selectVectorMapShapes, {
            state: false, 
            text: 'Enable Select Shapes In Vector Map Layers'
        }
    ], [
        Settings.alwaysNewLayers, {
            state: false, 
            text: 'Always Create New Layer When Selecting Tool'
        }
    ],
]);

class SettingsManager {
    static #localStorage;
    static #settings = _.cloneDeep(DefaultSettings);

    static init(options = {}) {
        LogManager.logDebug(FILENAME, 'init', 'Initialization started');
        
        // Update the states of the settings with values from localStorage
        this.#localStorage = this.#getBrowserData();
        this.#settings.forEach((value, key) => {
            if(key in this.#localStorage) {
                value.state = this.#localStorage[key];
            }
        });
    }

    static setMap(map) { }

    static #getBrowserData() {
        LogManager.logDebug(FILENAME, 'getBrowserData', 'Loading settings from browser');
        
        const localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        return localStorage;
    }

    static getSettings() {
        return this.#settings;
    }

    static clear() {
        this.#settings = _.cloneDeep(DefaultSettings);
    }

    static addSetting(key, valueObj) {
        // Check if there exists a value already in the browser for this setting
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
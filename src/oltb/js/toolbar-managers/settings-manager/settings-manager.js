import _ from 'lodash';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { StateManager } from '../state-manager/state-manager';
import { DefaultSettings } from './default-settings';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';

const FILENAME = 'settings-manager.js';
const I18N__BASE = 'managers.settingsManager.settings';

const LocalStorageNodeName = LocalStorageKeys.settingsManager;
const LocalStorageDefaults = Object.freeze({});

/**
 * About:
 * SettingsManager
 * 
 * Description:
 * Manages all user settings. 
 * The settings can be viewed and updated using the SettingsTool.
 */
class SettingsManager extends BaseManager {
    static #localStorage;
    static #settings;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');
        
        this.#localStorage = this.#getBrowserData();
        this.#settings = _.cloneDeep(DefaultSettings);

        // Note: 
        // The runtime state must be updated with values from localStorage
        this.#settings.forEach((value, key) => {
            // Note:
            // Append the i18n data, the actual text for the current language
            // will be fetched when the SettingsModal is created each time
            value.i18nKey = key;
            value.i18nBase = I18N__BASE;

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

    //--------------------------------------------------------------------
    // # Section: Internal
    //--------------------------------------------------------------------
    static #getBrowserData() {
        LogManager.logDebug(FILENAME, 'getBrowserData', 'Loading settings from browser');
        
        const localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        return localStorage;
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static clear() {
        this.#settings = _.cloneDeep(DefaultSettings);
    }

    static addSetting(key, valueObj) {
        // Note: 
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

    static getSettings() {
        return this.#settings;
    }
}

export { SettingsManager };
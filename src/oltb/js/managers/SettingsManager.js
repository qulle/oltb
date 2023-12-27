import _ from 'lodash';
import { LogManager } from './LogManager';
import { StateManager } from './StateManager';
import { DefaultSettings } from './settings-manager/DefaultSettings';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { TranslationManager } from './TranslationManager';

const FILENAME = 'managers/SettingsManager.js';
const I18N_BASE = 'managers.settingsManager';

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
class SettingsManager {
    static #localStorage;
    static #settings;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');
        
        this.#localStorage = this.#getBrowserData();
        this.#settings = _.cloneDeep(DefaultSettings);

        // Note: 
        // The runtime state must be updated with values from localStorage
        // The actual text for a setting must be added
        const i18n = TranslationManager.get(`${I18N_BASE}.settings`);
        this.#settings.forEach((value, key) => {
            value.text = i18n[key];

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
}

export { SettingsManager };
import _ from 'lodash';
import axios from 'axios';
import { LogManager } from '../log-manager/log-manager';
import { BaseManager } from '../base-manager';
import { StateManager } from '../state-manager/state-manager';
import { TippyManager } from '../tippy-manager/tippy-manager';
import { ConfigManager } from '../config-manager/config-manager';
import { LocalStorageKeys } from '../../browser-constants/local-storage-keys';
import { DefaultTranslation } from './default-translation';

const FILENAME = 'translation-manager.js';

const DefaultOptions = Object.freeze({
    url: './assets/i18n'
});

const DefaultLanguage = Object.freeze({
    text: 'English',
    value: 'en-us',
    translation: DefaultTranslation
});

const LocalStorageNodeName = LocalStorageKeys.translationManager;
const LocalStorageDefaults = Object.freeze({
    activeLanguageValue: DefaultLanguage.value 
});

/**
 * About:
 * TranslationManager
 * 
 * Description:
 * Manages loading and switching between different localizations.
 * 
 * Note:
 * In this context a:
 * 'translation' is data containing the acually key-value translations
 *    'language' is a object holding three value in the following format
 * {
 *     text: 'English',
 *     value: 'en-us',
 *     translation: translation
 * }
 */
class TranslationManager extends BaseManager {
    static #activeLanguage;
    static #languages;
    static #localStorage;
    static #options;

    //--------------------------------------------------------------------
    // # Section: Base Overrides
    //--------------------------------------------------------------------
    static async initAsync(options = {}) {
        this.#options = _.merge(_.cloneDeep(DefaultOptions), options);

        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        this.#languages = [];

        // Note:
        // Languages added by user in config.json
        const languageValues = this.#getLanguageValues();

        // Note:
        // Asynchronously load all i18n-JSON-files defined by the user
        return this.#loadLanguagesAsync(languageValues);
    }

    static setMap(map) { }

    static getName() {
        return FILENAME;
    }

    //--------------------------------------------------------------------
    // # Section: Fetching JSON-Languages
    //--------------------------------------------------------------------
    static async #fetchLanguagesAsync(values) {
        const timestamp = Date.now().toString();
        const requests = values.map(async (value) => {
            return axios.get(`${this.#options.url}/${value}.json`, {
                responseType: 'application/json',
                params: {
                    cache: timestamp
                },
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }).then((result) => {
                return JSON.parse(result.data);
            })
        });

        return await Promise.allSettled(requests);
    }

    static async #loadLanguagesAsync(values) {
        return this.#fetchLanguagesAsync(values).then((responses) => {
            responses.forEach((response) => {
                if(response.status === 'rejected') {
                    LogManager.logWarning(FILENAME, 'loadLanguagesAsync', {
                        info: 'Failed to load language(s)',
                        reason: response.reason,
                        status: response.status
                    });

                    return;
                }

                // Note:
                // The loaded translation must be paired with the correct language object
                // The meta object inside the <ab-cd>.json file has the text and value to use for this translation
                const loadedText = response.value.meta.text;
                const loadedValue = response.value.meta.value;

                if(!loadedText || !loadedValue) {
                    LogManager.logWarning(FILENAME, 'loadLanguagesAsync', {
                        info: 'Failed to find translation information in the meta section'
                    });

                    return;
                }

                const language = {
                    text: loadedText,
                    value: loadedValue,
                    translation: response.value
                };

                this.#languages.push(language);
            });

            if(this.#languages.length <= 0) {
                LogManager.logWarning(FILENAME, 'loadLanguagesAsync', {
                    info: 'No languages loaded, fallback to default language instance',
                    value: DefaultLanguage.value
                });

                this.#languages.push(_.cloneDeep(DefaultLanguage));
            }

            // Note:
            // Decide the active language based on three conditions
            // 1. Stored language in localStorage
            // 2. Given active lang in config.json
            // 3. Fallback default language
            const storedLanguageValue = this.#localStorage.activeLanguageValue;
            const storedLanguage = this.#languages.find((language) => {
                return language.value === storedLanguageValue;
            });

            const activeLanguageValue = ConfigManager.getConfig().localization.active;
            const activeLanguage = this.#languages.find((language) => {
                return language.value === activeLanguageValue;
            });

            this.#activeLanguage = storedLanguage ?? activeLanguage ?? _.cloneDeep(DefaultLanguage);

            return Promise.resolve({
                filename: FILENAME,
                result: true
            });
        });
    }

    static #getLanguageValues() {
        const values = [];
        const userValues = ConfigManager.getConfig().localization.languages;
    
        userValues.forEach((value) => {
            const exists = values.find((item) => {
                return item === value;
            });
            
            if(exists) {
                LogManager.logWarning(FILENAME, 'getLanguageValues', {
                    info: 'Language already added to be loaded',
                    value: value
                });

                return;
            }

            values.push(value);
        });

        return values;
    }

    //--------------------------------------------------------------------
    // # Section: Changing Languages
    //--------------------------------------------------------------------
    static #applyLanguage() {
        const i18nKey = 'data-oltb-i18n';
        const elements = window.document.querySelectorAll(`[${i18nKey}]`);

        elements.forEach((element) => {
            const path = element.getAttribute(i18nKey);
            const value = this.get(path);

            // Note: 
            // Tippy instances mus be handle first
            // This targets tool-buttons in the toolbar
            const tippyKey = 'data-tippy-content';
            if(element.hasAttribute(tippyKey)) {
                // Check if element should have pre or post content added
                const preValue = element.getAttribute('data-tippy-content-pre') || '';
                const postValue = element.getAttribute('data-tippy-content-post') || '';

                const concatedValue = `${preValue} ${value} ${postValue}`.trim();
                element.setAttribute(tippyKey, concatedValue);

                return;
            }

            // Note: 
            // Tippy instances mus be handle first
            // This targets all runtime delegates where the title attribute holds the tippy
            const tippyClass = 'oltb-tippy';
            if(element.classList.contains(tippyClass)) {
                element.setAttribute('title', value);

                return;
            }

            // Note: 
            // Input-fields with a placeholder value
            const placeholderKey = 'placeholder';
            if(element.hasAttribute(placeholderKey)) {
                element.setAttribute(placeholderKey, value);

                return;
            }

            // Note: 
            // Default is to replace the innerHTML for normal elements
            element.innerHTML = value;
        });

        // Note: 
        // The Tippy instances needs to be re-created
        TippyManager.applyLanguage();
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    static getDefaultLanguage() {
        return _.cloneDeep(DefaultLanguage);
    }

    static getLanguages() {
        return this.#languages;
    }

    static getActiveLanguage() {
        return this.#activeLanguage || _.cloneDeep(DefaultLanguage);
    }

    static setActiveLanguage(toLanguage) {
        if(!this.#activeLanguage) {
            this.#activeLanguage = this.getDefaultLanguage();
        }

        if(this.#activeLanguage.value === toLanguage.value) {
            LogManager.logWarning(FILENAME, 'setActiveLanguage', {
                info: 'Aborting language change, selected language is already active',
                to: toLanguage.value,
                active: this.#activeLanguage.value
            });

            return;
        }

        const language = this.#languages.find((language) => {
            return language.value === toLanguage.value;
        });

        if(!language || !_.has(language, ['translation'])) {
            LogManager.logWarning(FILENAME, 'setActiveLanguage', {
                info: 'Selected language not found',
                language: toLanguage
            });

            return;
        }

        this.#activeLanguage = language;
        this.#localStorage.activeLanguageValue = language.value;
        
        // Note:
        // The apply method will do the actuall replacing of values in the UI
        this.#applyLanguage();

        // Note:
        // To remember the current chosen language after a reload/reopen of the browser
        StateManager.setStateObject(LocalStorageNodeName, this.#localStorage);
    }

    static get(path) {
        const keys = path.split('.');
        const language = this.getActiveLanguage();
        const result = _.get(language.translation, keys, path);

        // Note: 
        // Check if the path is the same as result
        // If so then we failed to find a translation
        // Not all missing translations are found by this comparison
        // An object with many translations can be returned and the view/controller might try and access one 
        // using the wrong name, this will cause 'empty'/undefined to be displayed in view
        if(result === path) {
            LogManager.logWarning(FILENAME, 'get', {
                info: 'No translation found',
                keys: keys,
                path: path
            });
        }

        return result;
    }
}

export { TranslationManager };
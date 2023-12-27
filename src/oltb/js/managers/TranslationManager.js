import _ from 'lodash';
import { EnUs } from './translation-manager/en-us';
import { SvSe } from './translation-manager/sv-se';
import { LogManager } from './LogManager';
import { StateManager } from './StateManager';
import { TippyManager } from './TippyManager';
import { ConfigManager } from './ConfigManager';
import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';
import { hasNestedProperty } from '../helpers/browser/HasNestedProperty';

const FILENAME = 'managers/TranslationManager.js';

const LocalStorageNodeName = LocalStorageKeys.translationManager;
const LocalStorageDefaults = Object.freeze({
    activeLanguageValue: 'en-us' 
});

const DefaultLanguages = Object.freeze([
    {
        text: 'English',
        value: 'en-us',
        translation: EnUs
    },
    {
        text: 'Swedish',
        value: 'sv-se',
        translation: SvSe
    }
]);

const DefaultLanguage = DefaultLanguages[0];

// const LocalStorageNodeName = LocalStorageKeys.translationManager;
// const LocalStorageDefaults = Object.freeze({
//     activeLanguage: DefaultLanguage
// });

/**
 * About:
 * TranslationManager
 * 
 * Description:
 * Manages loading and switching between different localizations.
 * The toolbar is shipped with two languages (English and Swedish).
 */
class TranslationManager {
    static #activeLanguage;
    static #languages;
    static #localStorage;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        this.#localStorage = StateManager.getAndMergeStateObject(
            LocalStorageNodeName, 
            LocalStorageDefaults
        );

        // Note:
        // These languages are shiped with the application
        this.#languages = _.cloneDeep(DefaultLanguages);

        // Note:
        // Languages added by user in config.json
        const userLanguages = ConfigManager.getConfig().localization.languages;
        userLanguages.forEach((userLanguage) => {
            const existsLanguage = this.#languages.find((language) => {
                return language.value === userLanguage.value;
            });
            
            if(existsLanguage) {
                LogManager.logWarning(FILENAME, 'initAsync', {
                    info: 'Language already exists',
                    language: userLanguage
                });

                return;
            }

            // Note:
            // The language was not one of the default languages and should be added to the list of languages
            // TODO: Must load and parse the JSON for that language, for now use EnUs
            this.#languages.push({
                text: userLanguage.text,
                value: userLanguage.value,
                translation: _.cloneDeep(EnUs)
            });
        });

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

    static #applyLanguage() {
        const i18nKey = 'data-oltb-i18n';
        const elements = document.querySelectorAll(`[${i18nKey}]`);

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

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

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
        const language = this.#languages.find((language) => {
            return language.value === toLanguage.value;
        });

        if(!language || !hasNestedProperty(language, 'translation')) {
            LogManager.logWarning(FILENAME, 'setActiveLanguage', {
                info: 'Selected language not found',
                language: toLanguage
            });

            return;
        }

        this.#localStorage.activeLanguageValue = language.value;
        this.#activeLanguage = language;
        this.#applyLanguage();

        StateManager.setStateObject(LocalStorageNodeName, this.#localStorage);
    }

    static get(path) {
        const keys = path.split('.');
        const language = this.getActiveLanguage();
        const result = _.get(language.translation, keys, path);

        // Note: 
        // Check if the path is the same as result
        // If so then we failed to find a translation
        // Not all missing translations are found
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
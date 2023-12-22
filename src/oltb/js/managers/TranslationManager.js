import _ from 'lodash';
import { EnUs } from './translation-manager/en-us';
import { SvSe } from './translation-manager/sv-se';
import { LogManager } from './LogManager';
import { TippyManager } from './TippyManager';
// import { StateManager } from './StateManager';
import { ConfigManager } from './ConfigManager';
// import { LocalStorageKeys } from '../helpers/constants/LocalStorageKeys';

const FILENAME = 'managers/TranslationManager.js';

const DefaultLanguages = Object.freeze([
    {
        text: 'English',
        value: 'en-us'
    }, {
        text: 'Swedish',
        value: 'sv-se'
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
    static #translations;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        // Note: Default Translations
        this.#translations = {
            'en-us': EnUs,
            'sv-se': SvSe
        };

        // Note: Default languages
        this.#languages = [];
        DefaultLanguages.forEach((language) => {
            this.#languages.push({
                text: language.text,
                value: language.value
            });
        });

        // Note: Languages added by user in config.json
        const languages = ConfigManager.getConfig().localizations.languages;
        languages.forEach((language) => {
            const exists = this.#languages.find((item) => {
                return item.value === language.value;
            });

            if(!exists) {
                this.#languages.push({
                    text: language.text,
                    value: language.value
                });
            }
        });

        const activeLanguageValue = ConfigManager.getConfig().localizations.active;
        const activeLanguage = this.#languages.find((language) => {
            return language.value === activeLanguageValue;
        });
        
        // Note: Decide the active language based on three conditions
        // 1. Stored language in localStorage
        // 2. Given active lang in config.json
        // 3. Fallback default language
        this.#activeLanguage = activeLanguage ?? DefaultLanguage;  

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

            // Note: Tippy instances mus be handle first
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

            // Note: Tippy instances mus be handle first
            // This targets all runtime delegates where the title attribute holds the tippy
            const tippyClass = 'oltb-tippy';
            if(element.classList.contains(tippyClass)) {
                element.setAttribute('title', value);

                return;
            }

            // Note: Input-fields with a placeholder value
            const placeholderKey = 'placeholder';
            if(element.hasAttribute(placeholderKey)) {
                element.setAttribute(placeholderKey, value);

                return;
            }

            // Note: Default is to replace the innerHTML for normal elements
            element.innerHTML = value;
        });

        // Note: The Tippy instances needs to be re-created
        TippyManager.applyLanguage();
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static getDefaultLanguage() {
        return DefaultLanguage;
    }

    static getLanguages() {
        return this.#languages;
    }

    static getActiveLanguage() {
        return this.#activeLanguage;
    }

    static setActiveLanguage(lang) {
        this.#activeLanguage = lang;
        this.#applyLanguage();

        // StateManager.setStateObject();
    }

    static getActiveTranslation() {
        return this.#translations[this.#activeLanguage.value] || DefaultLanguage;
    }

    static get(path) {
        const keys = path.split('.');
        const translation = this.getActiveTranslation();
        const result = _.get(translation, keys, path);

        // Note: Check if the path is the same as result
        // If so then we failed to find a translation
        // Note: Not all missing translations are found
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
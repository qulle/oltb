import _ from 'lodash';
import { EnUs } from './translation-manager/en-us';
import { SvSe } from './translation-manager/sv-se';
import { LogManager } from './LogManager';
import { TippyManager } from './TippyManager';
import { ConfigManager } from './ConfigManager';

const FILENAME = 'managers/TranslationManager.js';

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

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        // Note: Two Default languages that is shipped with project
        this.#languages = {
            'en-us': EnUs,
            'sv-se': SvSe,
        };

        // TODO: Check if other has been saved in LocalStorage
        this.#activeLanguage = ConfigManager.getConfig().localizations.default;

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
            const key = element.getAttribute('');
            const value = this.get(key);

            // Note: Tippy instances mus be handle first
            const tippyKey = 'data-tippy-content';
            if(element.hasAttribute(tippyKey)) {
                return element.setAttribute(tippyKey, value);
            }

            element.innerHTML = value;
        });

        // Note: The Tippy instances needs to be re-created
        TippyManager.applyLanguage();
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    static getLanguages() {
        return ConfigManager.getConfig().localizations;
    }

    static getActiveLanguage() {
        return this.#activeLanguage;
    }

    static getActiveTranslation() {
        return this.#languages[this.#activeLanguage.value] || EnUs;
    }

    static setActive(lang) {
        this.#activeLanguage = lang;
        this.#applyLanguage();
    }

    static get(path) {
        const translation = this.getActiveTranslation();
        const keys = path.split('.');

        return _.get(translation, keys, path);
    }
}

export { TranslationManager };
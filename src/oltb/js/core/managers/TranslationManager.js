import { Config } from '../Config';
import { LogManager } from './LogManager';
import { TippyManager } from './TippyManager';

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
    static #activeLang;

    static async initAsync(options = {}) {
        LogManager.logDebug(FILENAME, 'initAsync', 'Initialization started');

        // TODO: Get from localstorage/config-manager
        this.#activeLang = {
            text: 'English',
            value: 'en-us'
        };

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

    static #get(key) {
        // TODO: Split key and fetch value from the loaded JSON structure 
        return 'Zooma Hem';
    }

    // -------------------------------------------------------------------
    // # Section: Internal
    // -------------------------------------------------------------------

    static #applyLanguage() {
        const i18nKey = 'data-oltb-i18n';
        const elements = document.querySelectorAll(`[${i18nKey}]`);

        elements.forEach((element) => {
            const key = element.getAttribute('');
            const value = this.#get(key);

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
        return Config.localizations;
    }

    static getActive() {
        return this.#activeLang;
    }

    static setActive(lang) {
        this.#activeLang = lang;

        // TODO: Make method to load JSON
        this.#applyLanguage();
        // this.#loadLanguageAsync().then((result) => {
        //     this.#applyLanguage(result);
        // }).catch((error) => {
        //     console.error(error);
        // });
    }
}

export { TranslationManager };
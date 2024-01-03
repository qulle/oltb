import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { SettingsManager } from '../../managers/SettingsManager';
import { createUICheckbox } from '../../creators/CreateUICheckbox';
import { TranslationManager } from '../../managers/TranslationManager';

const FILENAME = 'modal-extensions/SettingsModal.js';
const I18N_BASE = 'modalExtensions.settingsModal';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onSave: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles settings
 */
class SettingsModal extends ModalBase {
    #state = new Map();

    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            TranslationManager.get(`${I18N_BASE}.title`), 
            options.maximized, 
            options.onClose
        );
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    getName() {
        return FILENAME;
    }

    // -------------------------------------------------------------------
    // # Section: User Interface
    // -------------------------------------------------------------------

    #createModal() {
        const i18n = TranslationManager.get(`${I18N_BASE}.form`);
        const settingsFragment = document.createDocumentFragment();
        const settings = SettingsManager.getSettings();
        
        settings.forEach((settingObj, key) => {
            const [ checkboxWrapper, checkbox ] = createUICheckbox({
                idPrefix: key,
                text: settingObj.text,
                checked: settingObj.state,
                bottomMargin: true,
                listeners: {
                    'click': () => {
                        // Note:
                        // Update local state contained in the modal
                        // The state is saved persistently when the save button in the modal is pressed
                        this.#state.set(key, checkbox.checked);
                    }
                }
            });
            
            // Copy current state of each setting
            this.#state.set(key, settingObj.state);

            DOM.appendChildren(settingsFragment, [
                checkboxWrapper
            ]);
        });

        const buttonsWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-d-flex oltb-justify-content-between oltb-mt-15'
        });

        const saveButton = DOM.createElement({
            element: 'button', 
            text: i18n.save,
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onClick.bind(this)
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: i18n.cancel, 
            class: `oltb-dialog__btn oltb-btn ${
                isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'
            }`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onCancel.bind(this)
            }
        });

        DOM.appendChildren(buttonsWrapper, [
            cancelButton,
            saveButton
        ]);

        const modalContent = DOM.createElement({
            element: 'div',
            class: 'oltb-modal__content'
        });

        DOM.appendChildren(modalContent, [
            settingsFragment,
            buttonsWrapper,
        ]);

        this.show(modalContent);
    }

    // -------------------------------------------------------------------
    // # Section: Events
    // -------------------------------------------------------------------

    #onClick() {
        this.#state.forEach((value, key) => {
            SettingsManager.setSetting(key, value);
        });

        this.#state.clear();

        this.close();
        this.options.onSave instanceof Function && this.options.onSave();
    }

    #onCancel() {
        this.close();
        this.options.onCancel instanceof Function && this.options.onCancel();
    }
}

export { SettingsModal };
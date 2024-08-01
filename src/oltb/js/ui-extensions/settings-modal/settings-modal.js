import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseModal } from '../../ui-common/ui-modals/base-modal';
import { isDarkTheme } from '../../ui-helpers/is-dark-theme/is-dark-theme';
import { SettingsManager } from '../../toolbar-managers/settings-manager/settings-manager';
import { createUICheckbox } from '../../ui-creators/ui-checkbox/create-ui-checkbox';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const FILENAME = 'settings-modal.js';
const I18N__BASE = 'modalExtensions.settingsModal';

// Note:
// Only specify the unique options to this class
// Things to override on the BaseModal is passed directly
const DefaultOptions = Object.freeze({
    onSave: undefined,
    onCancel: undefined
});

/**
 * About:
 * Manager that handles settings
 */
class SettingsModal extends BaseModal {
    #buttons = [];
    #state = new Map();

    constructor(options = {}) {
        super({
            filename: FILENAME,
            title: TranslationManager.get(`${I18N__BASE}.title`),
            ...options
        });
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModalContent();
    }

    //--------------------------------------------------------------------
    // # Section: Overridden
    //--------------------------------------------------------------------
    getName() {
        return super.getName();
    }

    //--------------------------------------------------------------------
    // # Section: User Interface
    //--------------------------------------------------------------------
    #createModalContent() {
        const i18n = TranslationManager.get(`${I18N__BASE}.form`);
        const settingsFragment = window.document.createDocumentFragment();
        const settings = SettingsManager.getSettings();
        
        settings.forEach((settingObj, key) => {
            const [ checkboxWrapper, checkbox ] = createUICheckbox({
                idPrefix: key,
                i18nKey: `${settingObj.i18nBase}.${settingObj.i18nKey}`,
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
                'click': this.#onSave.bind(this)
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

        this.#buttons = [cancelButton, saveButton];
        this.show(modalContent);
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onSave() {
        this.#state.forEach((value, key) => {
            SettingsManager.setSetting(key, value);
        });

        this.#state.clear();

        this.close();
        this.options.onSave && this.options.onSave();
    }

    #onCancel() {
        this.close();
        this.options.onCancel && this.options.onCancel();
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    getButtons() {
        return this.#buttons;
    }
}

export { SettingsModal };
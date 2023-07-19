import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { SettingsManager } from '../../core/managers/SettingsManager';
import { generateCheckbox } from '../../generators/GenerateCheckbox';

const FILENAME = 'modal-extensions/SettingsModal.js';

const DefaultOptions = Object.freeze({
    maximized: false,
    onClose: undefined,
    onSave: undefined,
    onCancel: undefined
});

class SettingsModal extends ModalBase {
    #state = new Map();

    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');

        super(
            'Settings', 
            options.maximized, 
            options.onClose
        );
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    #createModal() {
        const settingsFragment = document.createDocumentFragment();
        const settings = SettingsManager.getSettings();
        
        settings.forEach((settingObj, key) => {
            const [ checkboxWrapper, checkbox ] = generateCheckbox({
                idPrefix: key,
                text: settingObj.text,
                checked: settingObj.state
            });

            checkbox.addEventListener('click', () => {
                // Update local state with new value
                // Is saved when save button is pressed
                this.#state.set(key, checkbox.checked);
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
            text: 'Save settings',
            class: 'oltb-dialog__btn oltb-btn oltb-btn--green-mid', 
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.#state.forEach((value, key) => {
                        SettingsManager.setSetting(key, value);
                    });

                    this.#state.clear();

                    this.close();
                    this.options.onSave instanceof Function && this.options.onSave();
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: 'Cancel', 
            class: `oltb-dialog__btn oltb-btn ${
                isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'
            }`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    this.options.onCancel instanceof Function && this.options.onCancel();
                }
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
}

export { SettingsModal };
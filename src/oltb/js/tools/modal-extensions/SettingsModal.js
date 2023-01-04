import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from '../../common/modals/ModalBase';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { SettingsManager } from '../../core/managers/SettingsManager';

const DEFAULT_OPTIONS = Object.freeze({
    onClose: undefined,
    onSave: undefined,
    onCancel: undefined
});

class SettingsModal extends ModalBase {
    #state = new Map();

    constructor(options = {}) {
        super('Settings', options.onClose);
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const settingsFragment = document.createDocumentFragment();
        const settings = SettingsManager.getSettings();
        
        settings.forEach((settingObj, key) => {
            const checkboxWrapper = DOM.createElement({
                element: 'div',
                    class: 'oltb-checkbox-wrapper'
            });

            const label = DOM.createElement({
                element: 'label',
                text: settingObj.text,
                class: 'oltb-checkbox-wrapper__title oltb-label--inline oltb-m-0',
                attributes: {
                    for: key
                }
            });

            const checkbox = DOM.createElement({
                element: 'input',
                id: key,
                class: 'oltb-checkbox-wrapper__checkbox',
                attributes: {
                    type: 'checkbox'
                },
                listeners: {
                    'click': () => {
                        // Update local state with new value
                        // Is saved when save button is pressed
                        this.#state.set(key, checkbox.checked);
                    }
                }
            });

            // Copy current state of each setting
            this.#state.set(key, settingObj.state);

            if(settingObj.state) {
                checkbox.setAttribute('checked', '');
            }

            DOM.appendChildren(checkboxWrapper, [
                checkbox, 
                label
            ]);
            
            settingsFragment.appendChild(checkboxWrapper);
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
                type: 'button'
            },
            listeners: {
                'click': () => {
                    this.#state.forEach((value, key) => {
                        SettingsManager.setSetting(key, value);
                    });

                    this.#state.clear();

                    this.close();
                    typeof this.options.onSave === 'function' && this.options.onSave();
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: 'Cancel', 
            class: `oltb-dialog__btn oltb-btn ${isDarkTheme() ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'}`,
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    typeof this.options.onCancel === 'function' && this.options.onCancel();
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
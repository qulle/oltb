import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { DialogBase } from './DialogBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { ElementManager } from '../../core/managers/ElementManager';

const FILENAME = 'dialogs/Prompt.js';

const DefaultOptions = Object.freeze({
    title: 'Prompt',
    message: 'Oops missing prompt text',
    placeholder: undefined,
    value: undefined,
    confirmClass: 'oltb-btn--green-mid',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: undefined,
    onCancel: undefined,
    onInput: undefined
});

class Prompt extends DialogBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super();
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createDialog();
    }

    #createDialog() {
        const dialog = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog oltb-dialog--prompt oltb-animation oltb-animation--bounce'
        });

        const title = DOM.createElement({
            element: 'h2',
            class: 'oltb-dialog__title',
            text: this.options.title
        });

        const message = DOM.createElement({
            element: 'p',
            class: 'oltb-dialog__message',
            html: this.options.message
        });

        const inputBox = DOM.createElement({
            element: 'input',
            class: 'oltb-dialog__input oltb-input', 
            attributes: {
                'type': 'text'
            },
            listeners: {
                'input': () => {
                    this.options.onInput instanceof Function && this.options.onInput(inputBox.value.trim());
                }
            }
        });

        if(
            this.options.placeholder !== undefined && 
            this.options.placeholder !== null
        ) {
            inputBox.setAttribute('placeholder', this.options.placeholder);
        }

        if(
            this.options.value !== undefined && 
            this.options.value !== null
        ) {
            inputBox.value = this.options.value;
        }

        const buttonWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-dialog__buttons-wrapper'
        });

        const confirmButton = DOM.createElement({
            element: 'button', 
            text: this.options.confirmText,
            class: `oltb-dialog__btn oltb-btn ${this.options.confirmClass}`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    this.options.onConfirm instanceof Function && this.options.onConfirm(inputBox.value.trim());
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: this.options.cancelText,
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

        DOM.appendChildren(buttonWrapper, [
            cancelButton,
            confirmButton
        ]);

        DOM.appendChildren(dialog, [
            title,
            message,
            inputBox,
            buttonWrapper
        ]);

        DOM.appendChildren(this.backdrop, [
            dialog
        ]);

        const uiRefMapElement = ElementManager.getMapElement();
        DOM.appendChildren(uiRefMapElement, [
            this.backdrop
        ]);

        this.backdrop.focus();
    }
}

export { Prompt };
import DOM from '../../helpers/browser/DOM';
import DialogBase from './DialogBase';
import { MAP_ELEMENT } from '../../core/elements/index';

const DEFAULT_OPTIONS = {
    text: 'Default prompt text',
    placeholder: undefined,
    value: undefined,
    onConfirm: undefined,
    onCancel: undefined,
    confirmClass: 'oltb-btn--green-mid',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
};

class Prompt extends DialogBase {
    constructor(options = {}) {
        super();
        
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const dialog = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog oltb-dialog--prompt oltb-animation oltb-animation--bounce'
        });

        const message = DOM.createElement({
            element: 'p', 
            text: this.options.text
        });

        const inputBox = DOM.createElement({
            element: 'input',
            class: 'oltb-dialog__input oltb-input', 
            attributes: {
                type: 'text'
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
            class: 'oltb-dialog__button-wrapper'
        });

        const confirmButton = DOM.createElement({
            element: 'button', 
            text: this.options.confirmText,
            class: `oltb-dialog__btn oltb-btn ${this.options.confirmClass}`,
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    typeof this.options.onConfirm === 'function' && this.options.onConfirm(inputBox.value.trim());
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: this.options.cancelText,
            class: `oltb-dialog__btn oltb-btn ${this.isDark ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'}`,
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

        buttonWrapper.appendChild(cancelButton);
        buttonWrapper.appendChild(confirmButton);

        dialog.appendChild(message);
        dialog.appendChild(inputBox);
        dialog.appendChild(buttonWrapper);

        this.dialogBackdrop.appendChild(dialog);
        MAP_ELEMENT.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Prompt;
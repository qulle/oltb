import DialogBase from './DialogBase';
import DOM from '../../helpers/Browser/DOM';
import { mapElement } from '../../core/ElementReferences';

class Prompt extends DialogBase {
    constructor(options = {}) {
        super();
        
        const {
            text,
            placeholder,
            value,
            onConfirm,
            onCancel,
            confirmClass = 'oltb-btn--green-mid',
            confirmText = 'Confirm'
        } = options;

        const dialog = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog oltb-dialog--prompt oltb-animations--bounce'
        });

        const message = DOM.createElement({
            element: 'p', 
            text: text
        });

        const inputBox = DOM.createElement({
            element: 'input',
            class: 'oltb-dialog__input oltb-input', 
            attributes: {
                type: 'text'
            }
        });

        if(placeholder !== undefined && placeholder !== null) {
            inputBox.setAttribute('placeholder', placeholder);
        }

        if(value !== undefined && value !== null) {
            inputBox.value = value;
        }

        const buttonWrapper = DOM.createElement({
            element: 'div',
            class: 'oltb-dialog__button-wrapper'
        });

        const confirmButton = DOM.createElement({
            element: 'button', 
            text: confirmText,
            class: `oltb-dialog__btn oltb-btn ${confirmClass}`,
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    typeof onConfirm === 'function' && onConfirm(inputBox.value.trim());
                }
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: 'Cancel',
            class: `oltb-dialog__btn oltb-btn ${this.isDark ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'}`,
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': () => {
                    this.close();
                    typeof onCancel === 'function' && onCancel(); 
                }
            }
        });

        buttonWrapper.appendChild(cancelButton);
        buttonWrapper.appendChild(confirmButton);

        dialog.appendChild(message);
        dialog.appendChild(inputBox);
        dialog.appendChild(buttonWrapper);

        this.dialogBackdrop.appendChild(dialog);
        mapElement.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Prompt;
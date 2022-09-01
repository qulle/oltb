import DialogBase from './DialogBase';
import DOM from '../../helpers/Browser/DOM';
import { mapElement } from '../../core/ElementReferences';

class Confirm extends DialogBase {
    constructor(options = {}) {
        super();

        const { 
            text, 
            html, 
            onConfirm, 
            onCancel, 
            confirmClass = 'oltb-btn--red-mid', 
            confirmText = 'Yes' 
        } = options;

        const dialog = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog oltb-dialog--confirm oltb-animations--bounce'
        });

        const message = DOM.createElement({
            element: 'p'
        });

        if(text) {
            message.innerText = text;
        }

        if(html) {
            message.innerHTML = html;
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
                    typeof onConfirm === 'function' && onConfirm();
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
        dialog.appendChild(buttonWrapper);

        this.dialogBackdrop.appendChild(dialog);
        mapElement.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Confirm;
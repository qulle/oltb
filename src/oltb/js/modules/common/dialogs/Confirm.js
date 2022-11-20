import DOM from '../../helpers/browser/DOM';
import DialogBase from './DialogBase';
import { MAP_ELEMENT } from '../../core/ElementReferences';

const DEFAULT_OPTIONS = {
    text: undefined,
    html: undefined,
    onConfirm: undefined,
    onCancel: undefined,
    confirmClass: 'oltb-btn--red-mid',
    confirmText: 'Yes'
};

class Confirm extends DialogBase {
    constructor(options = {}) {
        super();

        this.options = { ...DEFAULT_OPTIONS, ...options };

        const dialog = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog oltb-dialog--confirm oltb-animation oltb-animation--bounce'
        });

        const message = DOM.createElement({
            element: 'p'
        });

        if(this.options.text) {
            message.innerText = this.options.text;
        }

        if(this.options.html) {
            message.innerHTML = this.options.html;
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
                    typeof this.options.onConfirm === 'function' && this.options.onConfirm();
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
                    typeof this.options.onCancel === 'function' && this.options.onCancel();
                }
            }
        });

        buttonWrapper.appendChild(cancelButton);
        buttonWrapper.appendChild(confirmButton);

        dialog.appendChild(message);
        dialog.appendChild(buttonWrapper);

        this.dialogBackdrop.appendChild(dialog);
        MAP_ELEMENT.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Confirm;
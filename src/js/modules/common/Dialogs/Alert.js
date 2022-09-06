import DialogBase from './DialogBase';
import DOM from '../../helpers/Browser/DOM';
import { mapElement } from '../../core/ElementReferences';

const DEFAULT_OPTIONS = {
    text: undefined,
    html: undefined,
    confirmText: 'Ok'
};

class Alert extends DialogBase {
    constructor(options = {}) {
        super();
        
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const dialog = DOM.createElement({
            element: 'div',
            class: 'oltb-dialog oltb-dialog--alert oltb-animations--bounce'
        });

        if(this.options.text) {
            const message = DOM.createElement({
                element: 'p', 
                text: text
            });

            dialog.appendChild(message);
        }

        if(this.options.html) {
            dialog.innerHTML = this.options.html;
        }

        const buttonWrapper = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog__button-wrapper'
        });

        const okButton = DOM.createElement({
            element: 'button',
            text: this.options.confirmText,
            class: 'oltb-dialog__btn oltb-btn oltb-btn--blue-mid',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.close.bind(this)
            }
        });

        buttonWrapper.appendChild(okButton);
        dialog.appendChild(buttonWrapper);

        this.dialogBackdrop.appendChild(dialog);
        mapElement.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Alert;
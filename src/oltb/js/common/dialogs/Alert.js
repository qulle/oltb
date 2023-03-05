import { DOM } from '../../helpers/browser/DOM';
import { DialogBase } from './DialogBase';
import { MAP_ELEMENT } from '../../core/elements/index';

const FILENAME = 'dialogs/Alert.js';
const DEFAULT_OPTIONS = Object.freeze({
    title: 'Alert',
    message: 'Oops missing alert message',
    onConfirm: undefined,
    confirmText: 'Ok'
});

class Alert extends DialogBase {
    constructor(options = {}) {
        super();
        
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const dialog = DOM.createElement({
            element: 'div',
            class: 'oltb-dialog oltb-dialog--alert oltb-animation oltb-animation--bounce'
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

        const buttonWrapper = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog__buttons-wrapper'
        });

        const okButton = DOM.createElement({
            element: 'button',
            text: this.options.confirmText,
            class: 'oltb-dialog__btn oltb-btn oltb-btn--blue-mid',
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

        DOM.appendChildren(buttonWrapper, [
            okButton
        ]);

        DOM.appendChildren(dialog, [
            title,
            message,
            buttonWrapper
        ]);

        this.backdrop.appendChild(dialog);
        MAP_ELEMENT.appendChild(this.backdrop);
        this.backdrop.focus();
    }
}

export { Alert };
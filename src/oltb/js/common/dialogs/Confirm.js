import { DOM } from '../../helpers/browser/DOM';
import { DialogBase } from './DialogBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { ElementManager } from '../../core/managers/ElementManager';

const FILENAME = 'dialogs/Confirm.js';

const DefaultOptions = Object.freeze({
    title: 'Confirm',
    message: 'Oops missing confirm message',
    onConfirm: undefined,
    onCancel: undefined,
    confirmClass: 'oltb-btn--red-mid',
    confirmText: 'Yes',
    cancelText: 'Cancel'
});

class Confirm extends DialogBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super();

        this.options = { ...DefaultOptions, ...options };
        this.#createDialog();
    }

    #createDialog() {
        const dialog = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog oltb-dialog--confirm oltb-animation oltb-animation--bounce'
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
                    this.options.onConfirm instanceof Function && this.options.onConfirm();
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
                type: 'button'
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
            buttonWrapper
        ]);

        DOM.appendChildren(this.backdrop, [
            dialog
        ]);

        const mapElement = ElementManager.getMapElement();
        DOM.appendChildren(mapElement, [
            this.backdrop
        ]);

        this.backdrop.focus();
    }
}

export { Confirm };
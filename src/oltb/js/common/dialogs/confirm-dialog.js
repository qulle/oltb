import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { BaseDialog } from './base-dialog';
import { isDarkTheme } from '../../helpers/is-dark-theme';
import { ElementManager } from '../../managers/element-manager/element-manager';

const CLASS_DIALOG = 'oltb-dialog';
const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_BOUNCE = `${CLASS_ANIMATION}--bounce`;

const DefaultOptions = Object.freeze({
    title: 'Confirm',
    message: 'Oops missing message',
    confirmClass: 'oltb-btn--red-mid',
    confirmText: 'Yes',
    cancelText: 'Cancel',
    onConfirm: undefined,
    onCancel: undefined
});

class ConfirmDialog extends BaseDialog {
    constructor(options = {}) {
        super();

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createDialog();
    }

    #createDialog() {
        const dialog = DOM.createElement({
            element: 'div', 
            class: `${CLASS_DIALOG} ${CLASS_DIALOG}--confirm ${CLASS_ANIMATION} ${CLASS_ANIMATION_BOUNCE}`
        });

        const title = DOM.createElement({
            element: 'h2',
            class: `${CLASS_DIALOG}__title`,
            text: this.options.title
        });

        const message = DOM.createElement({
            element: 'p',
            class: `${CLASS_DIALOG}__message`,
            html: this.options.message
        });

        const buttonWrapper = DOM.createElement({
            element: 'div', 
            class: `${CLASS_DIALOG}__buttons-wrapper`
        });

        const confirmButton = DOM.createElement({
            element: 'button',
            text: this.options.confirmText, 
            class: `${CLASS_DIALOG}__btn oltb-btn ${this.options.confirmClass}`,
            attributes: {
                'type': 'button' 
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
            class: `${CLASS_DIALOG}__btn oltb-btn ${ isDarkTheme() 
                ? 'oltb-btn--gray-mid' 
                : 'oltb-btn--gray-dark'
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

export { ConfirmDialog };
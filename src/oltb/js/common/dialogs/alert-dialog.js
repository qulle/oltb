import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom';
import { BaseDialog } from './base-dialog';
import { ElementManager } from '../../managers/element-manager/element-manager';

const CLASS_DIALOG = 'oltb-dialog';
const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_BOUNCE = `${CLASS_ANIMATION}--bounce`;

const DefaultOptions = Object.freeze({
    title: 'Alert',
    message: 'Oops missing message',
    confirmText: 'Ok',
    onConfirm: undefined
});

class AlertDialog extends BaseDialog {
    constructor(options = {}) {
        super();
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createDialog();
    }

    #createDialog() {
        const dialog = DOM.createElement({
            element: 'div',
            class: `${CLASS_DIALOG} ${CLASS_DIALOG}--alert ${CLASS_ANIMATION} ${CLASS_ANIMATION_BOUNCE}`
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

        const okButton = DOM.createElement({
            element: 'button',
            text: this.options.confirmText,
            class: `${CLASS_DIALOG}__btn oltb-btn oltb-btn--blue-mid`,
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

        DOM.appendChildren(buttonWrapper, [
            okButton
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
        ])

        this.backdrop.focus();
    }
}

export { AlertDialog };
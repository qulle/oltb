import _ from 'lodash';
import { DOM } from '../../helpers/browser/dom-factory';
import { BaseDialog } from './base-dialog';
import { ElementManager } from '../../managers/element-manager/element-manager';

const CLASS__DIALOG = 'oltb-dialog';
const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_BOUNCE = `${CLASS__ANIMATION}--bounce`;

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
            class: `${CLASS__DIALOG} ${CLASS__DIALOG}--alert ${CLASS__ANIMATION} ${CLASS__ANIMATION_BOUNCE}`
        });

        const title = DOM.createElement({
            element: 'h2',
            class: `${CLASS__DIALOG}__title`,
            text: this.options.title
        });

        const message = DOM.createElement({
            element: 'p',
            class: `${CLASS__DIALOG}__message`,
            html: this.options.message
        });

        const buttonWrapper = DOM.createElement({
            element: 'div', 
            class: `${CLASS__DIALOG}__buttons-wrapper`
        });

        const okButton = DOM.createElement({
            element: 'button',
            text: this.options.confirmText,
            class: `${CLASS__DIALOG}__btn oltb-btn oltb-btn--blue-mid`,
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
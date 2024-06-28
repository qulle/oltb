import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseDialog } from './base-dialog';
import { isDarkTheme } from '../../ui-helpers/is-dark-theme/is-dark-theme';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const CLASS__DIALOG = 'oltb-dialog';
const CLASS__DIALOG_TYPE = `${CLASS__DIALOG}--prompt`;
const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_BOUNCE = `${CLASS__ANIMATION}--bounce`;

const DefaultOptions = Object.freeze({
    title: 'Prompt',
    message: '',
    placeholder: undefined,
    value: undefined,
    confirmClass: 'oltb-btn--green-mid',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: undefined,
    onCancel: undefined,
    onInput: undefined
});

class PromptDialog extends BaseDialog {
    constructor(options = {}) {
        super();
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createDialog();
    }

    #isValid(value) {
        return value !== undefined && value !== null;
    }

    #createDialog() {
        const dialog = DOM.createElement({
            element: 'div', 
            class: `${CLASS__DIALOG} ${CLASS__DIALOG_TYPE} ${CLASS__ANIMATION} ${CLASS__ANIMATION_BOUNCE}`
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

        const input = DOM.createElement({
            element: 'input',
            class: `${CLASS__DIALOG}__input oltb-input`, 
            attributes: {
                'type': 'text'
            },
            listeners: {
                'input': () => {
                    this.#onInput(input);
                }
            }
        });

        if(this.#isValid(this.options.placeholder)) {
            input.setAttribute('placeholder', this.options.placeholder);
        }

        if(this.#isValid(this.options.value)) {
            input.value = this.options.value;
        }

        const buttonWrapper = DOM.createElement({
            element: 'div',
            class: `${CLASS__DIALOG}__buttons-wrapper`
        });

        const confirmButton = DOM.createElement({
            element: 'button', 
            text: this.options.confirmText,
            class: `${CLASS__DIALOG}__btn oltb-btn ${this.options.confirmClass}`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onConfirm.bind(this, input)
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button', 
            text: this.options.cancelText,
            class: `${CLASS__DIALOG}__btn oltb-btn ${ isDarkTheme() 
                ? 'oltb-btn--gray-mid' 
                : 'oltb-btn--gray-dark'
            }`,
            attributes: {
                'type': 'button'
            },
            listeners: {
                'click': this.#onCancel.bind(this)
            }
        });

        DOM.appendChildren(buttonWrapper, [
            cancelButton,
            confirmButton
        ]);

        DOM.appendChildren(dialog, [
            title,
            message,
            input,
            buttonWrapper
        ]);

        DOM.appendChildren(this.backdrop, [
            dialog
        ]);

        const uiRefMapElement = ElementManager.getMapElement();
        DOM.appendChildren(uiRefMapElement, [
            this.backdrop
        ]);

        this.buttons = [cancelButton, confirmButton];
        this.backdrop.focus();
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onInput(input) {
        this.options.onInput && this.options.onInput(input.value.trim());
    }

    #onConfirm(input) {
        this.close();
        this.options.onConfirm && this.options.onConfirm(input.value.trim());
    }

    #onCancel() {
        this.close();
        this.options.onCancel && this.options.onCancel(); 
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    getClassType() {
        return CLASS__DIALOG_TYPE;
    }
}

export { PromptDialog };
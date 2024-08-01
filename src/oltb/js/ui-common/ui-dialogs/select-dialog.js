import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { BaseDialog } from './base-dialog';
import { isDarkTheme } from '../../ui-helpers/is-dark-theme/is-dark-theme';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';

const CLASS__DIALOG = 'oltb-dialog';
const CLASS__DIALOG_TYPE = `${CLASS__DIALOG}--select`;
const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_BOUNCE = `${CLASS__ANIMATION}--bounce`;

const DefaultOptions = Object.freeze({
    title: 'Select',
    message: '',
    value: undefined,
    options: [],
    confirmClass: 'oltb-btn--green-mid',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: undefined,
    onCancel: undefined,
    onChange: undefined
});

class SelectDialog extends BaseDialog {
    constructor(options = {}) {
        super();

        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createDialog();
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

        const select = DOM.createElement({
            element: 'select',
            class: `${CLASS__DIALOG}__select oltb-select`,
            listeners: {
                'change': () => {
                    this.#onChange(select);
                }
            }
        });

        this.options.options.forEach((item) => {
            const option = DOM.createElement({
                element: 'option',
                text: item.text,
                value: item.value
            });

            DOM.appendChildren(select, [
                option
            ]);
        });

        if(this.options.value) {
            select.value = this.options.value;
        }else if(this.options.options.length > 0) {
            select.value = this.options.options[0].value;
        }else {
            select.value = '';
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
                'click': this.#onConfirm.bind(this, select)
            }
        });

        const cancelButton = DOM.createElement({
            element: 'button',
            text: this.options.cancelText,
            class: `${CLASS__DIALOG}__btn oltb-btn ${isDarkTheme()
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
            select,
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
    #onChange(select) {
        this.options.onChange && this.options.onChange({
            text: select.options[select.selectedIndex].text.trim(),
            value: select.value.trim()
        });
    }

    #onConfirm(select) {
        this.close();

        const fromValue = this.options.value;
        const fromOption = this.options.options.find((option) => {
            return option.value === fromValue;
        });

        const toValue = select.value;
        const toOption = select.options[select.selectedIndex];

        this.options.onConfirm && this.options.onConfirm({
            from: {
                text: fromOption.text.trim(),
                value: fromValue.trim()
            },
            to: {
                text: toOption.text.trim(),
                value: toValue.trim()
            }
        });
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

export { SelectDialog };
import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { DialogBase } from './DialogBase';
import { LogManager } from '../../core/managers/LogManager';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { ElementManager } from '../../core/managers/ElementManager';

const FILENAME = 'dialogs/Select.js';
const CLASS_DIALOG = 'oltb-dialog';
const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_BOUNCE = `${CLASS_ANIMATION}--bounce`;

const DefaultOptions = Object.freeze({
    title: 'Select',
    message: 'Oops missing message',
    value: undefined,
    options: [],
    confirmClass: 'oltb-btn--green-mid',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: undefined,
    onCancel: undefined,
    onChange: undefined
});

class Select extends DialogBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        super();
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createDialog();
    }

    #createDialog() {
        const dialog = DOM.createElement({
            element: 'div', 
            class: `${CLASS_DIALOG} ${CLASS_DIALOG}--prompt ${CLASS_ANIMATION} ${CLASS_ANIMATION_BOUNCE}`
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

        const select = DOM.createElement({
            element: 'select',
            class: `${CLASS_DIALOG}__select oltb-select`, 
            listeners: {
                'change': () => {
                    this.options.onChange instanceof Function && this.options.onChange({
                        text: select.options[select.selectedIndex].text.trim(),
                        value: select.value.trim()
                    });
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

        select.value = this.options.value.value;

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
                    this.options.onConfirm instanceof Function && this.options.onConfirm({
                        from: {
                            text: this.options.value.text,
                            value: this.options.value.value
                        },
                        to: {
                            text: select.options[select.selectedIndex].text.trim(),
                            value: select.value.trim()
                        }
                    });
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

        this.backdrop.focus();
    }
}

export { Select };
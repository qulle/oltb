import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { ConfigManager } from '../../toolbar-managers/config-manager/config-manager';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { TranslationManager } from '../../toolbar-managers/translation-manager/translation-manager';

const CLASS__TOAST = 'oltb-toast';
const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_SLIDE_IN = `${CLASS__ANIMATION}--slide-in`;
const CLASS__ANIMATION_SLIDE_OUT = `${CLASS__ANIMATION}--slide-out`;
const CLASS__ANIMATION_LINEAR_SPINNER = `${CLASS__ANIMATION}--linear-spinner`;

const DefaultOptions = Object.freeze({
    title: 'Toast',
    prefix: '',
    postfix: '',
    message: '',
    i18nKey: undefined,
    type: 'info',
    autoremove: false,
    clickToRemove: true,
    spinner: false
});

class BaseToast {
    constructor(options = {}) {
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createToast();
    }

    #createToast() {
        this.toast = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOAST} ${CLASS__TOAST}--${
                this.options.type
            } ${CLASS__ANIMATION} ${CLASS__ANIMATION_SLIDE_IN} oltb-d-flex` 
        });
        
        if(this.options.clickToRemove) {
            this.toast.classList.add(`${CLASS__TOAST}--clickable`);
            this.toast.addEventListener(Events.browser.click, this.remove.bind(this));
        }

        if(this.options.spinner) {
            const spinnerElement = DOM.createElement({
                element: 'div',
                class: `oltb-spinner oltb-spinner--small ${CLASS__ANIMATION} ${CLASS__ANIMATION_LINEAR_SPINNER}`
            });
            
            DOM.appendChildren(this.toast, [
                spinnerElement
            ]);
        }

        const container = DOM.createElement({
            element: 'div',
            class: `${CLASS__TOAST}__container ${this.options.spinner ? 'oltb-ml-0625' : ''}`
        });

        // Note:
        // If the i18nKey is specified, the language must be fetched
        // The key is also appended to the title and message element
        // so that a active toast can do a hot-swap of the displayed language
        if(this.options.i18nKey) {
            const i18n = TranslationManager.get(this.options.i18nKey);
            this.options.title = i18n.title;
            this.options.message = i18n.message;
        }

        const title = DOM.createElement({
            element: 'h4',
            text: this.options.title,
            class: `${CLASS__TOAST}__title`,
            ...(this.options.i18nKey && { attributes: {
                'data-oltb-i18n': `${this.options.i18nKey}.title`
            }}),
        });

        const concatMessage = `${this.options.prefix} ${this.options.message} ${this.options.postfix}`;
        const message = DOM.createElement({
            element: 'p', 
            html: concatMessage,
            class: `${CLASS__TOAST}__message`,
            ...(this.options.i18nKey && { attributes: {
                'data-oltb-i18n': `${this.options.i18nKey}.message`
            }}),
        });
    
        DOM.appendChildren(container, [
            title,
            message
        ]);
        
        DOM.appendChildren(this.toast, [
            container
        ]);

        const uiRefToastElement = ElementManager.getToastElement();
        uiRefToastElement.prepend(this.toast);

        if(this.options.autoremove) {
            const duration = ConfigManager.getConfig().autoRemovalDuation.normal;
            window.setTimeout(() => {
                DOM.removeElement(this);
            }, duration);
        }
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    remove() {
        this.toast.classList.add(`${CLASS__TOAST}--remove`, CLASS__ANIMATION_SLIDE_OUT);
    
        // Note: 
        // Remove the toast from DOM after animation finishes
        const duration = ConfigManager.getConfig().animationDuration.fast;
        window.setTimeout(() => {
            DOM.removeElement(this.toast);
            
            if(this.options.onRemove) {
                this.options.onRemove();
            }
        }, duration);
    }

    getType() {
        return this.options.type;
    }

    getTitle() {
        return this.options.title;
    }

    getMessage() {
        return this.options.message;
    }

    isSpinner() {
        return this.options.spinner;
    }

    isClickableToRemove() {
        return this.options.clickToRemove;
    }

    isAutoremove() {
        return this.options.autoremove;
    }

    getElement() {
        return this.toast;
    }

    getI18NKey() {
        return this.options.i18nKey;
    }

    static get Info() { 
        return 'info'; 
    }

    static get Warning() { 
        return 'warning'; 
    }

    static get Error() { 
        return 'error'; 
    }

    static get Success() { 
        return 'success'; 
    }
}

export { BaseToast };
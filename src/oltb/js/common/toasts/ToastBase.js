import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from '../../managers/LogManager';
import { ConfigManager } from '../../managers/ConfigManager';
import { ElementManager } from '../../managers/ElementManager';
import { TranslationManager } from '../../managers/TranslationManager';

const FILENAME = 'toasts/ToastBase.js';
const CLASS_TOAST = 'oltb-toast';
const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_SLIDE_IN = `${CLASS_ANIMATION}--slide-in`;
const CLASS_ANIMATION_SLIDE_OUT = `${CLASS_ANIMATION}--slide-out`;
const CLASS_ANIMATION_LINEAR_SPINNER = `${CLASS_ANIMATION}--linear-spinner`;

const DefaultOptions = Object.freeze({
    title: 'Toast',
    message: '',
    i18nKey: undefined,
    type: 'info',
    autoremove: undefined,
    clickToRemove: true,
    spinner: false
});

class ToastBase {
    constructor(options = {}) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createToast();
    }

    #createToast() {
        this.toast = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOAST} ${CLASS_TOAST}--${
                this.options.type
            } ${CLASS_ANIMATION} ${CLASS_ANIMATION_SLIDE_IN} oltb-d-flex` 
        });
        
        if(this.options.clickToRemove) {
            this.toast.classList.add(`${CLASS_TOAST}--clickable`);
            this.toast.addEventListener(Events.browser.click, this.remove.bind(this));
        }

        if(this.options.spinner) {
            const spinnerElement = DOM.createElement({
                element: 'div',
                class: `oltb-spinner oltb-spinner--small ${CLASS_ANIMATION} ${CLASS_ANIMATION_LINEAR_SPINNER}`
            });
            
            DOM.appendChildren(this.toast, [
                spinnerElement
            ]);
        }

        const container = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOAST}__container ${this.options.spinner ? 'oltb-ml-0625' : ''}`
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
            class: `${CLASS_TOAST}__title`,
            ...(this.options.i18nKey && { attributes: {
                'data-oltb-i18n': `${this.options.i18nKey}.title`
            }}),
        });

        const message = DOM.createElement({
            element: 'p', 
            html: this.options.message,
            class: `${CLASS_TOAST}__message`,
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
            window.setTimeout(() => {
                DOM.removeElement(this);
            }, this.options.autoremove);
        }
    }

    // -------------------------------------------------------------------
    // # Section: Public API
    // -------------------------------------------------------------------

    remove() {
        this.toast.classList.add(`${CLASS_TOAST}--remove`, CLASS_ANIMATION_SLIDE_OUT);
    
        // Note: 
        // Remove the toast from DOM after animation finishes
        const duration = ConfigManager.getConfig().animationDuration.fast;
        window.setTimeout(() => {
            DOM.removeElement(this.toast);
            
            if(this.options.onRemove instanceof Function) {
                this.options.onRemove();
            }
        }, duration);
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

export { ToastBase };
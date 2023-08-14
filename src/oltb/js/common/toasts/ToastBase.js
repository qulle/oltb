import _ from 'lodash';
import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../../core/Config';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from '../../core/managers/LogManager';
import { ElementManager } from '../../core/managers/ElementManager';

const FILENAME = 'toasts/ToastBase.js';
const CLASS_TOAST = 'oltb-toast';
const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_SLIDE_IN = `${CLASS_ANIMATION}--slide-in`;
const CLASS_ANIMATION_SLIDE_OUT = `${CLASS_ANIMATION}--slide-out`;
const CLASS_ANIMATION_LINEAR_SPINNER = `${CLASS_ANIMATION}--linear-spinner`;

const DefaultOptions = Object.freeze({
    title: 'Toast',
    message: '',
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

        const title = DOM.createElement({
            element: 'h4',
            text: this.options.title,
            class: `${CLASS_TOAST}__title`
        });

        const message = DOM.createElement({
            element: 'p', 
            html: this.options.message,
            class: `${CLASS_TOAST}__message`
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
    
        // Remove the toast from DOM after animation finishes
        window.setTimeout(() => {
            DOM.removeElement(this.toast);
            
            if(this.options.onRemove instanceof Function) {
                this.options.onRemove();
            }
        }, Config.animationDuration.fast);
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
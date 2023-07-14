import { DOM } from '../../helpers/browser/DOM';
import { Config } from '../../core/Config';
import { Events } from '../../helpers/constants/Events';
import { LogManager } from '../../core/managers/LogManager';
import { ElementManager } from '../../core/managers/ElementManager';

const FILENAME = 'toasts/ToastBase.js';
const CLASS_TOAST = 'oltb-toast';

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
        
        this.options = { ...DefaultOptions, ...options };
        this.#createToast();
    }

    #createToast() {
        this.toast = DOM.createElement({
            element: 'div',
            class: `${CLASS_TOAST} ${CLASS_TOAST}--${
                this.options.type
            } oltb-animation oltb-animation--slide-in oltb-d-flex` 
        });
        
        if(this.options.clickToRemove) {
            this.toast.classList.add(`${CLASS_TOAST}--clickable`);
            this.toast.addEventListener(Events.browser.click, this.remove.bind(this));
        }

        if(this.options.spinner) {
            const spinnerElement = DOM.createElement({
                element: 'div',
                class: 'oltb-spinner oltb-spinner--small oltb-animation oltb-animation--linear-spinner'
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
                this.remove();
            }, this.options.autoremove);
        }
    }

    remove() {
        this.toast.classList.add(`${CLASS_TOAST}--remove`, 'oltb-animation--slide-out');
    
        // Remove the toast from DOM after animation finishes
        window.setTimeout(() => {
            this.toast.remove();
            
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
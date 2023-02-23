import { DOM } from '../../helpers/browser/DOM';
import { CONFIG } from '../../core/Config';
import { EVENTS } from '../../helpers/constants/Events';
import { TOAST_ELEMENT } from '../../core/elements/index';

const DEFAULT_OPTIONS = Object.freeze({
    title: 'Toast',
    message: '',
    type: 'info',
    autoremove: undefined,
    clickToRemove: true,
    spinner: false
});

class ToastBase {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const toast = DOM.createElement({
            element: 'div',
            class: `oltb-toast oltb-toast--${this.options.type} oltb-animation oltb-animation--slide-in oltb-d-flex` 
        });

        this.toast = toast;
        
        if(this.options.clickToRemove) {
            toast.classList.add('oltb-toast--clickable');
            toast.addEventListener(EVENTS.Browser.Click, this.remove.bind(this));
        }

        if(this.options.spinner) {
            const spinnerElement = DOM.createElement({
                element: 'div',
                class: 'oltb-spinner oltb-spinner--small oltb-animation oltb-animation--linear-spinner'
            });
            
            toast.appendChild(spinnerElement);
        }

        const container = DOM.createElement({
            element: 'div',
            class: `oltb-toast__container ${this.options.spinner ? 'oltb-ml-0625' : ''}`
        });

        const title = DOM.createElement({
            element: 'h4',
            text: this.options.title,
            class: 'oltb-toast__title'
        });

        const message = DOM.createElement({
            element: 'p', 
            html: this.options.message,
            class: 'oltb-toast__message'
        });
    
        DOM.appendChildren(container, [
            title,
            message
        ]);
        
        DOM.appendChildren(toast, [
            container
        ]);

        TOAST_ELEMENT.prepend(toast);

        if(this.options.autoremove) {
            window.setTimeout(() => {
                this.remove();
            }, this.options.autoremove);
        }
    }

    remove() {
        this.toast.classList.add('oltb-toast--remove', 'oltb-animation--slide-out');
    
        // Remove the toast from DOM after animation finishes
        window.setTimeout(() => {
            this.toast.remove();
            
            if(typeof this.options.onRemove === 'function') {
                this.options.onRemove();
            }
        }, CONFIG.AnimationDuration.Fast);
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
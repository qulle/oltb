import DOM from '../../helpers/Browser/DOM';
import { TOAST_ELEMENT } from '../../core/ElementReferences';
import { EVENTS } from '../../helpers/Constants/Events';

const DEFAULT_OPTIONS = {
    text: 'Default toast',
    type: 'info',
    autoremove: undefined,
    clickToClose: true,
    spinner: false
};

class Toaster {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };

        const toast = DOM.createElement({
            element: 'div',
            class: `oltb-toast oltb-toast--${this.options.type} oltb-animations--slide-in oltb-d-flex` 
        });

        this.toast = toast;
        
        if(this.options.clickToClose) {
            toast.classList.add('oltb-toast--clickable');
            toast.addEventListener(EVENTS.Browser.Click, this.remove.bind(this));
        }

        if(this.options.spinner) {
            const spinnerElement = DOM.createElement({
                element: 'div',
                class: 'oltb-spinner oltb-spinner--small oltb-animations--linear-spinner'
            });
            
            toast.appendChild(spinnerElement);
        }

        const message = DOM.createElement({
            element: 'p', 
            text: this.options.text,
            class: `oltb-toast__message ${this.options.spinner ? 'oltb-ml-0625' : ''}`
        });
    
        toast.appendChild(message);
        
        // Add the toast to the DOM
        TOAST_ELEMENT.prepend(toast);

        // If options.autoremove was set, start timer to remove after x ms
        if(this.options.autoremove) {
            setTimeout(() => {
                this.remove();
            }, this.options.autoremove);
        }
    }

    remove() {
        this.toast.classList.add('oltb-toast--remove', 'oltb-animations--slide-out');
    
        // Remove the toast from DOM after animation finishes
        setTimeout(() => {
            this.toast.remove();
        }, 250);
    }

    static get Info()    { return 'info'; }
    static get Warning() { return 'warning'; }
    static get Error()   { return 'error'; }
    static get Success() { return 'success'; }
}

export default Toaster;
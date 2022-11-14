import DOM from '../../helpers/Browser/DOM';
import CONFIG from '../../core/Config';
import { TOAST_ELEMENT } from '../../core/ElementReferences';
import { EVENTS } from '../../helpers/constants/Events';

const DEFAULT_OPTIONS = {
    text: 'Default toast',
    type: 'info',
    autoremove: undefined,
    clickToRemove: true,
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
        
        if(this.options.clickToRemove) {
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
        
        TOAST_ELEMENT.prepend(toast);

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
            
            if(typeof this.options.onRemove === 'function') {
                this.options.onRemove();
            }
        }, CONFIG.animationDuration.fast);
    }

    static get Info()    { return 'info'; }
    static get Warning() { return 'warning'; }
    static get Error()   { return 'error'; }
    static get Success() { return 'success'; }
}

export default Toaster;
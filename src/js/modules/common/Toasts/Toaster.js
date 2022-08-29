import { toastElement } from '../../core/ElementReferences';
import DOM from '../../helpers/Browser/DOM';

class Toaster {
    constructor(options = {}) {
        const {
            text = 'Toast message',
            type = Toaster.Info,
            autoremove,
            clickToClose = true,
            spinner = false
        } = options;

        const toast = DOM.createElement({
            element: 'div',
            class: `oltb-toast oltb-toast--${type} oltb-animations--slide-in oltb-d-flex` 
        });

        this.toast = toast;
        
        if(clickToClose) {
            toast.classList.add('oltb-toast--clickable');
            toast.addEventListener('click', this.remove.bind(this));
        }

        if(spinner) {
            const spinnerElement = DOM.createElement({
                element: 'div',
                class: 'oltb-spinner oltb-spinner--small oltb-animations--linear-spinner'
            });
            
            toast.appendChild(spinnerElement);
        }

        const message = DOM.createElement({
            element: 'p', 
            text: text,
            class: `oltb-toast__message ${spinner ? 'oltb-ml-0625' : ''}`
        });
    
        toast.appendChild(message);
        
        // Add the toast to the DOM
        toastElement.insertAdjacentElement('afterbegin', toast);

        // If options.autoremove was set, start timer to remove after x ms
        if(autoremove) {
            setTimeout(() => {
                this.remove();
            }, options.autoremove);
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
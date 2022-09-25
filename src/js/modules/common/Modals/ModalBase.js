import DOM from '../../helpers/Browser/DOM';
import { mapElement } from '../../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../../core/Icons';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';
import { EVENTS } from '../../helpers/Constants/Events';

const ANIMATION_CLASS = 'oltb-animations--bounce';

class ModalBase {
    constructor(title, onClose) {
        const modalBackdrop = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal-backdrop oltb-modal-backdrop--fixed',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'click': this.bounceAnimation,
                'keydown': trapFocusKeyListener
            }
        });

        const modal = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal oltb-animations--bounce'
        });

        const modalHeader = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal__header'
        });

        const modalTitle = DOM.createElement({
            element: 'h2', 
            html: title,
            class: 'oltb-modal__title'
        });

        const modalClose = DOM.createElement({
            element: 'button', 
            html: getIcon({
                path: SVG_PATHS.Close, 
                fill: 'none', 
                stroke: 'currentColor'
            }),
            class: 'oltb-modal__close oltb-btn oltb-btn--blank',
            attributes: {
                type: 'button'
            },
            listeners: {
                'click': this.close.bind(this)
            }
        });

        modalBackdrop.appendChild(modal);
        modal.appendChild(modalHeader);
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(modalClose);

        this.modalBackdrop = modalBackdrop;
        this.modal = modal;
        this.onClose = onClose;

        window.addEventListener(EVENTS.Browser.KeyUp, (event) => {
            if(event.key === 'Escape') {
                this.close();
            }
        });
    }

    bounceAnimation(event) {
        // To prevent trigger the animation if clicked in the modal and not the backdrop
        if(event.target !== this) {
            return;
        }

        const modal = this.firstElementChild;

        // Trigger reflow of DOM, reruns animation when class is added back
        modal.classList.remove(ANIMATION_CLASS);
        void modal.offsetWidth;
        modal.classList.add(ANIMATION_CLASS);
    }

    show(modalContent) {
        this.modal.appendChild(modalContent);
        mapElement.appendChild(this.modalBackdrop);
        this.modalBackdrop.focus();
    }

    close() {
        this.modalBackdrop.removeEventListener(EVENTS.Browser.KeyDown, trapFocusKeyListener);
        this.modalBackdrop.remove();

        // User defined callback from constructor
        if(typeof this.onClose === 'function') {
            this.onClose();
        }
    }
}

export default ModalBase;
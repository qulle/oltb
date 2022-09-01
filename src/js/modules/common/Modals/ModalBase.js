import DOM from '../../helpers/Browser/DOM';
import { mapElement } from '../../core/ElementReferences';
import { SVGPaths, getIcon } from '../../core/Icons';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';

const ANIMATION_CLASS = 'oltb-animations--bounce';

class ModalBase {
    constructor(title = 'Modal title') {
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
                path: SVGPaths.Close, 
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

        window.addEventListener('keyup', (event) => {
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
        this.modalBackdrop.removeEventListener('keydown', trapFocusKeyListener);
        this.modalBackdrop.remove();
    }
}

export default ModalBase;
import DOM from '../../helpers/Browser/DOM';
import { MAP_ELEMENT } from '../../core/ElementReferences';
import { SVG_PATHS, getIcon } from '../../core/SVGIcons';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';
import { EVENTS } from '../../helpers/constants/Events';

const ANIMATION_CLASS = 'oltb-animations--bounce';

class ModalBase {
    constructor(title, onClose) {
        this.modalBackdrop = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal-backdrop oltb-modal-backdrop--fixed',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'click': this.bounceAnimation.bind(this),
                'keydown': trapFocusKeyListener
            }
        });

        this.modal = DOM.createElement({
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

        this.modalBackdrop.appendChild(this.modal);
        this.modal.appendChild(modalHeader);
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(modalClose);

        this.onClose = onClose;

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(event.key.toLowerCase() === 'escape') {
            this.close();
        }
    }

    isBackdropClicked(event) {
        return event.target === this.modalBackdrop;
    }

    bounceAnimation(event) {
        if(!this.isBackdropClicked(event)) {
            return;
        }

        const modal = this.modalBackdrop.firstElementChild;
        DOM.rerunAnimation(modal, ANIMATION_CLASS);
    }

    show(modalContent) {
        this.modal.appendChild(modalContent);
        MAP_ELEMENT.appendChild(this.modalBackdrop);
        this.modalBackdrop.focus();
    }

    close() {
        this.modalBackdrop.removeEventListener(EVENTS.Browser.KeyDown, trapFocusKeyListener);
        this.modalBackdrop.remove();

        // Note: User defined callback from constructor
        if(typeof this.onClose === 'function') {
            this.onClose();
        }
    }
}

export default ModalBase;
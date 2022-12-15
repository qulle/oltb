import DOM from '../../helpers/browser/DOM';
import { KEYS } from '../../helpers/constants/Keys';
import { EVENTS } from '../../helpers/constants/Events';
import { MAP_ELEMENT } from '../../core/elements/index';
import { SVG_PATHS, getIcon } from '../../core/icons/GetIcon';
import { trapFocusKeyListener } from '../../helpers/browser/TrapFocus';

const ANIMATION_CLASS = 'oltb-animation--bounce';

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
            class: 'oltb-modal oltb-animation oltb-animation--bounce'
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
                path: SVG_PATHS.close, 
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

        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(event.key.toLowerCase() === KEYS.escape) {
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
        DOM.runAnimation(modal, ANIMATION_CLASS);
    }

    show(modalContent) {
        this.modal.appendChild(modalContent);
        MAP_ELEMENT.appendChild(this.modalBackdrop);
        this.modalBackdrop.focus();
    }

    close() {
        this.modalBackdrop.removeEventListener(EVENTS.browser.keyDown, trapFocusKeyListener);
        this.modalBackdrop.remove();

        // User defined callback from constructor
        if(typeof this.onClose === 'function') {
            this.onClose();
        }
    }
}

export default ModalBase;
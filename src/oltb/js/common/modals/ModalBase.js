import { DOM } from '../../helpers/browser/DOM';
import { KEYS } from '../../helpers/constants/Keys';
import { EVENTS } from '../../helpers/constants/Events';
import { MAP_ELEMENT } from '../../core/elements/index';
import { SVG_PATHS, getIcon } from '../../core/icons/GetIcon';
import { trapFocusKeyListener } from '../../helpers/browser/TrapFocus';

const ANIMATION_CLASS = 'oltb-animation--bounce';

class ModalBase {
    constructor(title, maximized, onClose) {
        this.backdrop = DOM.createElement({
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
            class: `oltb-modal ${maximized ? 'oltb-modal--maximized' : ''} oltb-animation oltb-animation--bounce`
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
                path: SVG_PATHS.Close.Stroked, 
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

        DOM.appendChildren(modalHeader, [
            modalTitle, 
            modalClose
        ]);

        this.backdrop.appendChild(this.modal);
        this.modal.appendChild(modalHeader);

        this.onClose = onClose;

        window.addEventListener(EVENTS.Browser.KeyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(event.key.toLowerCase() === KEYS.Escape) {
            this.close();
        }
    }

    isBackdropClicked(event) {
        return event.target === this.backdrop;
    }

    bounceAnimation(event) {
        if(!this.isBackdropClicked(event)) {
            return;
        }

        const modal = this.backdrop.firstElementChild;
        DOM.runAnimation(modal, ANIMATION_CLASS);
    }

    show(modalContent) {
        this.modal.appendChild(modalContent);
        MAP_ELEMENT.appendChild(this.backdrop);
        this.backdrop.focus();
    }

    close() {
        this.backdrop.removeEventListener(EVENTS.Browser.KeyDown, trapFocusKeyListener);
        this.backdrop.remove();

        // User defined callback from constructor
        if(typeof this.onClose === 'function') {
            this.onClose();
        }
    }
}

export { ModalBase };
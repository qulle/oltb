import { DOM } from '../../helpers/browser/DOM';
import { Keys } from '../../helpers/constants/Keys';
import { Events } from '../../helpers/constants/Events';
import { trapFocus } from '../../helpers/browser/TrapFocus';
import { LogManager } from '../../core/managers/LogManager';
import { ElementManager } from '../../core/managers/ElementManager';
import { SvgPaths, getIcon } from '../../core/icons/GetIcon';

const FILENAME = 'modals/ModalBase.js';
const CLASS_ANIMATION = 'oltb-animation--bounce';

class ModalBase {
    constructor(title, maximized, onClose) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        this.#createModal(title, maximized, onClose);
    }

    #createModal(title, maximized, onClose) {
        this.onClose = onClose;
        this.backdrop = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal-backdrop oltb-modal-backdrop--fixed',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'click': this.bounceAnimation.bind(this),
                'keydown': trapFocus
            }
        });

        this.modal = DOM.createElement({
            element: 'div', 
            class: `oltb-modal ${
                maximized ? 'oltb-modal--maximized' : ''
            } oltb-animation oltb-animation--bounce`
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
                path: SvgPaths.close.stroked, 
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

        DOM.appendChildren(this.modal, [
            modalHeader
        ]);

        DOM.appendChildren(this.backdrop, [
            this.modal
        ]);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(event.key === Keys.valueEscape) {
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
        DOM.runAnimation(modal, CLASS_ANIMATION);
    }

    show(modalContent) {
        DOM.appendChildren(this.modal, [
            modalContent
        ]);

        const uiRefMapElement = ElementManager.getMapElement();
        DOM.appendChildren(uiRefMapElement, [
            this.backdrop
        ]);

        this.backdrop.focus();
    }

    close() {
        this.backdrop.removeEventListener(Events.browser.keyDown, trapFocus);
        DOM.removeElement(this.backdrop);

        // Note: Consumer callback
        if(this.onClose instanceof Function) {
            this.onClose();
        }
    }
}

export { ModalBase };
import { DOM } from '../../helpers/browser/dom-factory';
import { Keys } from '../../helpers/constants/keys';
import { Events } from '../../helpers/constants/events';
import { trapFocus } from '../../helpers/browser/trap-focus';
import { LogManager } from '../../managers/log-manager/log-manager';
import { ElementManager } from '../../managers/element-manager/element-manager';
import { SvgPaths, getIcon } from '../../icons/get-icon';

const FILENAME = 'BaseModal.js';
const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_BOUNCE = `${CLASS__ANIMATION}--bounce`;
const CLASS__MODAL = 'oltb-modal';
const CLASS__MODAL_BACKDROP = `${CLASS__MODAL}-backdrop`;

class BaseModal {
    constructor(title, maximized, onClosed) {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        this.#createModal(title, maximized, onClosed);
    }

    #createModal(title, maximized, onClosed) {
        this.onClosed = onClosed;
        this.backdrop = DOM.createElement({
            element: 'div', 
            class: `${CLASS__MODAL_BACKDROP} ${CLASS__MODAL_BACKDROP}--fixed`,
            attributes: {
                'tabindex': '-1'
            },
            listeners: {
                'click': this.bounceAnimation.bind(this),
                'keydown': trapFocus
            }
        });

        this.modal = DOM.createElement({
            element: 'div', 
            class: `${CLASS__MODAL} ${ maximized 
                ? `${CLASS__MODAL}--maximized` 
                : ''
            } ${CLASS__ANIMATION} ${CLASS__ANIMATION_BOUNCE}`
        });

        const modalHeader = DOM.createElement({
            element: 'div', 
            class: `${CLASS__MODAL}__header`
        });

        const modalTitle = DOM.createElement({
            element: 'h2', 
            html: title,
            class: `${CLASS__MODAL}__title`
        });

        const modalClose = DOM.createElement({
            element: 'button', 
            html: getIcon({
                path: SvgPaths.close.stroked, 
                fill: 'none', 
                stroke: 'currentColor',
                strokeWidth: 1
            }),
            class: `${CLASS__MODAL}__close oltb-btn oltb-btn--blank`,
            attributes: {
                'type': 'button'
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

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    onWindowKeyUp(event) {
        if(event.key === Keys.valueEscape) {
            this.close();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    isBackdropClicked(event) {
        return event.target === this.backdrop;
    }

    bounceAnimation(event) {
        if(!this.isBackdropClicked(event)) {
            return;
        }

        const modal = this.backdrop.firstElementChild;
        DOM.runAnimation(modal, CLASS__ANIMATION_BOUNCE);
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

        // Note: 
        // @Consumer callback
        if(this.onClosed instanceof Function) {
            this.onClosed();
        }
    }
}

export { BaseModal };
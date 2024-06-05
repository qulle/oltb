import _ from 'lodash';
import { DOM } from '../../browser-helpers/dom-factory';
import { Keys } from '../../browser-constants/keys';
import { Events } from '../../browser-constants/events';
import { trapFocus } from '../../browser-helpers/trap-focus';
import { ElementManager } from '../../toolbar-managers/element-manager/element-manager';
import { SvgPaths, getSvgIcon } from '../../ui-icons/get-svg-icon/get-svg-icon';

const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_BOUNCE = `${CLASS__ANIMATION}--bounce`;
const CLASS__MODAL = 'oltb-modal';
const CLASS__MODAL_BACKDROP = `${CLASS__MODAL}-backdrop`;

const DefaultOptions = Object.freeze({
    title: 'Modal',
    maximized: false,
    onClose: undefined,
    content: undefined
});

class BaseModal {
    constructor(options = {}) {
        this.options = _.merge(_.cloneDeep(DefaultOptions), options);
        this.#createModal();
    }

    #createModal() {
        this.backdrop = DOM.createElement({
            element: 'div', 
            class: `${CLASS__MODAL_BACKDROP} ${CLASS__MODAL_BACKDROP}--fixed`,
            attributes: {
                'tabindex': '-1'
            },
            listeners: {
                'click': this.#bounceAnimation.bind(this),
                'keydown': trapFocus
            }
        });

        this.modal = DOM.createElement({
            element: 'div', 
            class: `${CLASS__MODAL} ${ this.options.maximized 
                ? `${CLASS__MODAL}--maximized` 
                : ''
            } ${CLASS__ANIMATION} ${CLASS__ANIMATION_BOUNCE}`
        });

        this.modalContent = DOM.createElement({
            element: 'div', 
            class: `${CLASS__MODAL}__content`
        });

        const modalHeader = DOM.createElement({
            element: 'div', 
            class: `${CLASS__MODAL}__header`
        });

        const modalTitle = DOM.createElement({
            element: 'h2', 
            html: this.options.title,
            class: `${CLASS__MODAL}__title`
        });

        const modalClose = DOM.createElement({
            element: 'button', 
            html: getSvgIcon({
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
            modalHeader,
            this.modalContent,
        ]);

        DOM.appendChildren(this.backdrop, [
            this.modal
        ]);

        window.addEventListener(Events.browser.keyUp, this.onWindowKeyUp.bind(this));

        if(this.options.content) {
            this.show(this.options.content);
        }
    }

    #isBackdropClicked(event) {
        return event.target === this.backdrop;
    }

    #bounceAnimation(event) {
        if(!this.#isBackdropClicked(event)) {
            return;
        }

        const modal = this.backdrop.firstElementChild;
        DOM.runAnimation(modal, CLASS__ANIMATION_BOUNCE);
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
    getTitle() {
        return this.options.title;
    }

    getContent() {
        return this.options.content;
    }

    getOnClose() {
        return this.options.onClose;
    }

    isMaximized() {
        return this.options.maximized;
    }
    
    show(content) {
        this.options.content = content;

        if(typeof content === 'string') {
            this.modalContent.innerHTML = content;
        }else {
            DOM.appendChildren(this.modalContent, [
                content
            ]);
        }

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
        if(this.options.onClose instanceof Function) {
            this.options.onClose();
        }
    }
}

export { BaseModal };
import { DOM } from '../../browser-helpers/dom-factory';
import { Events } from '../../browser-constants/events';
import { trapFocus } from '../../browser-helpers/trap-focus';
import { KeyboardKeys } from '../../browser-constants/keyboard-keys';

const CLASS__ANIMATION = 'oltb-animation';
const CLASS__ANIMATION_BOUNCE = `${CLASS__ANIMATION}--bounce`;
const CLASS__DIALOG_BACKDROP = 'oltb-dialog-backdrop';

class BaseDialog {
    constructor() {
        this.backdrop = DOM.createElement({
            element: 'div', 
            class: `${CLASS__DIALOG_BACKDROP} ${CLASS__DIALOG_BACKDROP}--fixed`,
            attributes: {
                'tabindex': '-1'
            },
            listeners: {
                'click': this.#bounceAnimation.bind(this),
                'keydown': trapFocus
            }
        });

        window.addEventListener(Events.browser.keyUp, this.#onWindowKeyUp.bind(this));
    }

    #isBackdropClicked(event) {
        return event.target === this.backdrop;
    }

    #bounceAnimation(event) {
        if(!this.#isBackdropClicked(event)) {
            return;
        }

        const dialog = this.backdrop.firstElementChild;
        DOM.runAnimation(dialog, CLASS__ANIMATION_BOUNCE);
    }

    //--------------------------------------------------------------------
    // # Section: Events
    //--------------------------------------------------------------------
    #onWindowKeyUp(event) {
        if(event.key === KeyboardKeys.valueEscape) {
            this.close();
        }
    }

    //--------------------------------------------------------------------
    // # Section: Public API
    //--------------------------------------------------------------------
    close() {
        this.backdrop.removeEventListener(Events.browser.keyDown, trapFocus);
        DOM.removeElement(this.backdrop);
    }
}

export { BaseDialog };
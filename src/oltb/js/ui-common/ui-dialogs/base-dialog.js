import { DOM } from '../../helpers/browser/dom-factory';
import { Keys } from '../../helpers/constants/keys';
import { Events } from '../../helpers/constants/events';
import { trapFocus } from '../../helpers/browser/trap-focus';

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
        if(event.key === Keys.valueEscape) {
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
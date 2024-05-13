import { DOM } from '../../helpers/browser/dom';
import { Keys } from '../../helpers/constants/Keys';
import { Events } from '../../helpers/constants/Events';
import { trapFocus } from '../../helpers/browser/TrapFocus';

const CLASS_ANIMATION = 'oltb-animation';
const CLASS_ANIMATION_BOUNCE = `${CLASS_ANIMATION}--bounce`;
const CLASS_DIALOG_BACKDROP = 'oltb-dialog-backdrop';

class BaseDialog {
    constructor() {
        this.backdrop = DOM.createElement({
            element: 'div', 
            class: `${CLASS_DIALOG_BACKDROP} ${CLASS_DIALOG_BACKDROP}--fixed`,
            attributes: {
                'tabindex': '-1'
            },
            listeners: {
                'click': this.bounceAnimation.bind(this),
                'keydown': trapFocus
            }
        });

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

        const dialog = this.backdrop.firstElementChild;
        DOM.runAnimation(dialog, CLASS_ANIMATION_BOUNCE);
    }

    close() {
        this.backdrop.removeEventListener(Events.browser.keyDown, trapFocus);
        DOM.removeElement(this.backdrop);
    }
}

export { BaseDialog };
import { DOM } from '../../helpers/browser/DOM';
import { Keys } from '../../helpers/constants/Keys';
import { Events } from '../../helpers/constants/Events';
import { trapFocus } from '../../helpers/browser/TrapFocus';
import { LogManager } from '../../core/managers/LogManager';

const FILENAME = 'dialogs/DialogBase.js';
const CLASS_ANIMATION = 'oltb-animation--bounce';

class DialogBase {
    constructor() {
        LogManager.logDebug(FILENAME, 'constructor', 'init');
        
        this.backdrop = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog-backdrop oltb-dialog-backdrop--fixed',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'click': this.bounceAnimation.bind(this),
                'keydown': trapFocus
            }
        });

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

        const dialog = this.backdrop.firstElementChild;
        DOM.runAnimation(dialog, CLASS_ANIMATION);
    }

    close() {
        this.backdrop.removeEventListener(Events.browser.keyDown, trapFocus);
        this.backdrop.remove();
    }
}

export { DialogBase };
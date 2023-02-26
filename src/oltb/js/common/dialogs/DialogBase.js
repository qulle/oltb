import { DOM } from '../../helpers/browser/DOM';
import { KEYS } from '../../helpers/constants/Keys';
import { EVENTS } from '../../helpers/constants/Events';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { trapFocusKeyListener } from '../../helpers/browser/TrapFocus';

const FILENAME = 'dialogs/DialogBase.js';
const ANIMATION_CLASS = 'oltb-animation--bounce';

class DialogBase {
    constructor() {
        this.backdrop = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog-backdrop oltb-dialog-backdrop--fixed',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'click': this.bounceAnimation.bind(this),
                'keydown': trapFocusKeyListener
            }
        });

        this.isDark = isDarkTheme();

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

        const dialog = this.backdrop.firstElementChild;
        DOM.runAnimation(dialog, ANIMATION_CLASS);
    }

    close() {
        this.backdrop.removeEventListener(EVENTS.Browser.KeyDown, trapFocusKeyListener);
        this.backdrop.remove();
    }
}

export { DialogBase };
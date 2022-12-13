import DOM from '../../helpers/browser/DOM';
import { EVENTS } from '../../helpers/constants/Events';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { trapFocusKeyListener } from '../../helpers/browser/TrapFocus';

const ANIMATION_CLASS = 'oltb-animation--bounce';

class DialogBase {
    constructor() {
        this.dialogBackdrop = DOM.createElement({
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

        window.addEventListener(EVENTS.browser.keyUp, this.onWindowKeyUp.bind(this));
    }

    onWindowKeyUp(event) {
        if(event.key.toLowerCase() === 'escape') {
            this.close();
        }
    }

    isBackdropClicked(event) {
        return event.target === this.dialogBackdrop;
    }

    bounceAnimation(event) {
        if(!this.isBackdropClicked(event)) {
            return;
        }

        const dialog = this.dialogBackdrop.firstElementChild;
        DOM.runAnimation(dialog, ANIMATION_CLASS);
    }

    close() {
        this.dialogBackdrop.removeEventListener(EVENTS.browser.keyDown, trapFocusKeyListener);
        this.dialogBackdrop.remove();
    }
}

export default DialogBase;
import DOM from '../../helpers/Browser/DOM';
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';

const ANIMATION_CLASS = 'oltb-animations--bounce';

class DialogBase {
    constructor() {
        const dialogBackdrop = DOM.createElement({
            element: 'div', 
            class: 'oltb-dialog-backdrop oltb-dialog-backdrop--fixed',
            attributes: {
                tabindex: '-1'
            },
            listeners: {
                'click': this.bounceAnimation,
                'keydown': trapFocusKeyListener
            }
        });

        this.dialogBackdrop = dialogBackdrop;
        this.isDark = isDarkTheme();

        window.addEventListener('keyup', (event) => {
            if(event.key === 'Escape') {
                this.close();
            }
        });
    }

    bounceAnimation(event) {
        // To prevent trigger the animation if clicked in the dialog and not the backdrop
        if(event.target !== this) {
            return;
        }

        const dialog = this.firstElementChild;

        // Trigger reflow of DOM, reruns animation when class is added back
        dialog.classList.remove(ANIMATION_CLASS);
        void dialog.offsetWidth;
        dialog.classList.add(ANIMATION_CLASS);
    }

    close() {
        this.dialogBackdrop.removeEventListener('keydown', trapFocusKeyListener);
        this.dialogBackdrop.remove();
    }
}

export default DialogBase;
import { isDarkTheme } from '../../helpers/IsDarkTheme';
import { trapFocusKeyListener } from '../../helpers/TrapFocus';

const animationClass = 'oltb-animations--bounce';

class DialogBase {
    constructor() {
        const dialogBackdrop = document.createElement('div');
        dialogBackdrop.className = 'oltb-dialog-backdrop oltb-dialog-backdrop--fixed';
        dialogBackdrop.setAttribute('tabindex', '-1');
        dialogBackdrop.addEventListener('keydown', trapFocusKeyListener);
        dialogBackdrop.addEventListener('click', this.bounceAnimation);

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

        dialog.classList.remove(animationClass);

        // Trigger reflow of DOM, reruns animation when class is added back
        void dialog.offsetWidth;

        dialog.classList.add(animationClass);
    }

    close() {
        this.dialogBackdrop.removeEventListener('keydown', trapFocusKeyListener);
        this.dialogBackdrop.remove();
    }
}

export default DialogBase;
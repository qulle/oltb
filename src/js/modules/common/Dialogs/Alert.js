import DialogBase from './DialogBase';
import { mapElement } from '../../core/ElementReferences';

class Alert extends DialogBase {
    constructor(options = {}) {
        super();

        const { 
            text, 
            html, 
            confirmText = 'Ok' 
        } = options;

        const dialog = document.createElement('div');
        dialog.className = 'oltb-dialog oltb-dialog--alert oltb-animations--bounce';

        if(text) {
            const message = document.createElement('p');
            message.innerText = text;
            dialog.appendChild(message);
        }

        if(html) {
            dialog.innerHTML = html;
        }

        const okButton = document.createElement('button');
        okButton.setAttribute('type', 'button');
        okButton.className = 'oltb-dialog__btn oltb-btn oltb-btn--mid-blue';
        okButton.innerText = confirmText;
        okButton.addEventListener('click', (event) => {
            this.close();
        });

        dialog.appendChild(okButton);

        this.dialogBackdrop.appendChild(dialog);
        mapElement.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Alert;
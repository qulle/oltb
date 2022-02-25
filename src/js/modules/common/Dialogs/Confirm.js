import DialogBase from './DialogBase';
import { mapElement } from '../../core/ElementReferences';

class Confirm extends DialogBase {
    constructor(options = {}) {
        super();

        const { 
            text, 
            html, 
            onConfirm, 
            onCancel, 
            confirmClass = 'oltb-btn--dark-red', 
            confirmText = 'Yes' 
        } = options;

        const dialog = document.createElement('div');
        dialog.className = 'oltb-dialog oltb-dialog--confirm oltb-animations--bounce';

        const message = document.createElement('p');

        if(text) {
            message.innerText = text;
        }

        if(html) {
            message.innerHTML = html;
        }

        const confirmButton = document.createElement('button');
        confirmButton.setAttribute('type', 'button');
        confirmButton.className = `oltb-dialog__btn oltb-btn ${confirmClass}`;
        confirmButton.innerText = confirmText;
        confirmButton.addEventListener('click', (event) => {
            this.close();
            typeof onConfirm === 'function' && onConfirm();
        });

        const cancelButton = document.createElement('button');
        cancelButton.setAttribute('type', 'button');
        cancelButton.className = `oltb-dialog__btn oltb-btn ${this.isDark ? 'oltb-btn--mid-gray' : 'oltb-btn--dark-gray'}`;
        cancelButton.innerText = 'Cancel';
        cancelButton.addEventListener('click', (event) => {
            this.close();
            typeof onCancel === 'function' && onCancel();
        });

        dialog.appendChild(message);
        dialog.appendChild(cancelButton);
        dialog.appendChild(confirmButton);

        this.dialogBackdrop.appendChild(dialog);
        mapElement.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Confirm;
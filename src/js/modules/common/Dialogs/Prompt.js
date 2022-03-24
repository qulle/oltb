import DialogBase from './DialogBase';
import { mapElement } from '../../core/ElementReferences';

class Prompt extends DialogBase {
    constructor(options = {}) {
        super();
        
        const {
            text,
            placeholder,
            value,
            onConfirm,
            onCancel,
            confirmClass = 'oltb-btn--green-mid',
            confirmText = 'Confirm'
        } = options;

        const dialog = document.createElement('div');
        dialog.className = 'oltb-dialog oltb-dialog--prompt oltb-animations--bounce';

        const message = document.createElement('p');
        message.innerText = text;

        const inputBox = document.createElement('input');
        inputBox.setAttribute('type', 'text');
        inputBox.className = 'oltb-dialog__input oltb-input';

        if(placeholder !== undefined && placeholder !== null) {
            inputBox.setAttribute('placeholder', placeholder);
        }

        if(value !== undefined && value !== null) {
            inputBox.value = value;
        }

        const confirmButton = document.createElement('button');
        confirmButton.setAttribute('type', 'button');
        confirmButton.className = `oltb-dialog__btn oltb-btn ${confirmClass}`;
        confirmButton.innerText = confirmText;
        confirmButton.addEventListener('click', (event) => {
            this.close();
            typeof onConfirm === 'function' && onConfirm(inputBox.value.trim());
        });

        const cancelButton = document.createElement('button');
        cancelButton.setAttribute('type', 'button');
        cancelButton.className = `oltb-dialog__btn oltb-btn ${this.isDark ? 'oltb-btn--gray-mid' : 'oltb-btn--gray-dark'}`;
        cancelButton.innerText = 'Cancel';
        cancelButton.addEventListener('click', (event) => {
            this.close();
            typeof onCancel === 'function' && onCancel();
        });

        dialog.appendChild(message);
        dialog.appendChild(inputBox);
        dialog.appendChild(cancelButton);
        dialog.appendChild(confirmButton);

        this.dialogBackdrop.appendChild(dialog);
        mapElement.appendChild(this.dialogBackdrop);
        this.dialogBackdrop.focus();
    }
}

export default Prompt;
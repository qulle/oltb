import { AlertDialog } from './alert-dialog';
import { PromptDialog } from './prompt-dialog';
import { SelectDialog } from './select-dialog';
import { ConfirmDialog } from './confirm-dialog';

class Dialog {
    static alert(options) {
        return new AlertDialog(options);
    }

    static confirm(options) {
        return new ConfirmDialog(options);
    }

    static prompt(options) {
        return new PromptDialog(options);
    }

    static select(options) {
        return new SelectDialog(options);
    }

    static get Success() {
        return 'oltb-btn--green-mid';
    }

    static get Danger() {
        return 'oltb-btn--red-mid';
    }
}

export { Dialog };
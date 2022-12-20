import { Alert } from './dialogs/Alert';
import { Prompt } from './dialogs/Prompt';
import { Confirm } from './dialogs/Confirm';

class Dialog {
    static alert(options) {
        return new Alert(options);
    }

    static confirm(options) {
        return new Confirm(options);
    }

    static prompt(options) {
        return new Prompt(options);
    }

    static get Success() {
        return 'oltb-btn--green-mid';
    }

    static get Danger() {
        return 'oltb-btn--red-mid';
    }
}

export { Dialog };
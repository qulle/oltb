import Alert from './dialogs/Alert';
import Confirm from './dialogs/Confirm';
import Prompt from './dialogs/Prompt';

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

export default Dialog;
import Alert from './Dialogs/Alert';
import Confirm from './Dialogs/Confirm';
import Prompt from './Dialogs/Prompt';

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
        return 'oltb-btn--dark-green';
    }

    static get Danger() {
        return 'oltb-btn--dark-red';
    }
}

export default Dialog;
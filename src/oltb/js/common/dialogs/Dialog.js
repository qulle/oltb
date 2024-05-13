import { Alert } from './Alert';
import { Prompt } from './Prompt';
import { Select } from './Select';
import { Confirm } from './Confirm';

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

    static select(options) {
        return new Select(options);
    }

    static get Success() {
        return 'oltb-btn--green-mid';
    }

    static get Danger() {
        return 'oltb-btn--red-mid';
    }
}

export { Dialog };
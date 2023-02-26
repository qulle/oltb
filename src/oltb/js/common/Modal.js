import { ModalWindow } from './modals/ModalWindow';

const FILENAME = 'common/Modal.js';

class Modal {
    static create(options) {
        return new ModalWindow({ 
            maximized: false, 
            onClose: undefined, 
            ...options 
        });
    }
}

export { Modal };
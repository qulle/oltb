import { ModalWindow } from './ModalWindow';

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
import { ModalWindow } from './modals/ModalWindow';

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
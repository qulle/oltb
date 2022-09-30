import ModalWindow from './modals/ModalWindow';

class Modal {
    static create(options) {
        return new ModalWindow(options);
    }
}

export default Modal;
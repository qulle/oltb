import ModalWindow from './Modals/ModalWindow';

class Modal {
    static create(options) {
        return new ModalWindow(options);
    }
}

export default Modal;
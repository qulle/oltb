import ModalWindow from './Modals/ModalWindow';

class Modal {
    static create(title, content) {
        return new ModalWindow(title, content);
    }
}

export default Modal;
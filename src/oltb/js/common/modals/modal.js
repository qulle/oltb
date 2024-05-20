import { BaseModal } from './base-modal';

class Modal {
    static create(options = {}) {
        return new BaseModal(
            options.title,
            options.maximized, 
            options.onClose,
            options.content
        );
    }
}

export { Modal };
import { BaseModal } from './base-modal';

class Modal {
    static create(options = {}) {
        return new BaseModal({
            title: options.title,
            maximized: options.maximized, 
            pushWidth: options.pushWidth, 
            onClose: options.onClose,
            content: options.content
        });
    }
}

export { Modal };
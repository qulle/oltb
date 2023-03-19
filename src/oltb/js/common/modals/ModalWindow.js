import { DOM } from '../../helpers/browser/DOM';
import { ModalBase } from './ModalBase';

const FILENAME = 'modals/ModalWindow.js';

const DefaultOptions = Object.freeze({
    title: 'Modal',
    content: 'Oops missing modal content'
});

class ModalWindow extends ModalBase {
    constructor(options = {}) {
        super(
            options.title || DefaultOptions.title,
            options.maximized,
            options.onClose
        );

        this.options = { ...DefaultOptions, ...options };
        this.#createModal();
    }

    #createModal() {
        this.modalContent = DOM.createElement({
            element: 'div', 
            class: 'oltb-modal__content'
        });

        this.setContent(this.options.content);
        this.show(this.modalContent);
    }

    setContent(content) {
        if(typeof content === 'string') {
            this.modalContent.innerHTML = content;
        }else {
            DOM.appendChildren(this.modalContent, [
                content
            ]);
        }
    }
}

export { ModalWindow };